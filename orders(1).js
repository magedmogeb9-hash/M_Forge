const express = require("express");
const axios = require("axios");
const Stripe = require("stripe");
const ProductModel = require("../models/Product");
const OrderModel = require("../models/Order");
const { checkApiKey } = require("../middleware/auth");
const { calculateProfitSharing } = require("../services/profitSharing");
const { detectFraud } = require("../services/fraudDetection");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../utils/validate");

const router = express.Router();

// Lazily create the Stripe client only when actually needed. This means a
// missing STRIPE_SECRET_KEY only breaks the create-order request (with a
// clear error) instead of crashing the whole server at startup.
let stripeClient = null;
function getStripeClient() {
    if (!process.env.STRIPE_SECRET_KEY) {
        const err = new Error("STRIPE_SECRET_KEY is not set. Add it to your .env file.");
        err.status = 500;
        throw err;
    }
    if (!stripeClient) stripeClient = Stripe(process.env.STRIPE_SECRET_KEY);
    return stripeClient;
}

// List orders, newest first, with basic pagination
router.get(
    "/",
    checkApiKey,
    asyncHandler(async (req, res) => {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

        const [orders, total] = await Promise.all([
            OrderModel.find()
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            OrderModel.countDocuments()
        ]);

        res.json({ page, limit, total, orders });
    })
);

// Get a single order by ID
router.get(
    "/:id",
    checkApiKey,
    asyncHandler(async (req, res) => {
        const order = await OrderModel.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.json(order);
    })
);

// Create an order: charge via Stripe, ship via DHL, split profit, flag fraud
router.post(
    "/",
    checkApiKey,
    asyncHandler(async (req, res) => {
        const errors = validateBody(req.body, {
            productId: { required: true, type: "string" },
            qty: { required: true, type: "number", min: 1 },
            customer: { required: true, type: "string" }
        });
        if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

        const { productId, qty, customer, cardToken } = req.body;

        const product = await ProductModel.findById(productId);
        if (!product) return res.status(404).json({ error: "Product not found" });

        if (product.stock !== undefined && product.stock < qty) {
            return res.status(409).json({ error: "Insufficient stock", available: product.stock });
        }

        const total = product.price * qty;

        const stripe = getStripeClient();
        const payment = await stripe.paymentIntents.create({
            amount: Math.round(total * 100),
            currency: "usd",
            payment_method: cardToken,
            confirm: true
        });

        let shippingTracking = null;
        try {
            const shipping = await axios.post(
                "https://api.dhl.com/shipments",
                { to: customer, weight: qty, product: product.name },
                { headers: { "DHL-API-Key": process.env.DHL_API_KEY }, timeout: 10000 }
            );
            shippingTracking = shipping.data.trackingNumber;
        } catch (shipErr) {
            // Payment already succeeded — don't fail the whole order over a
            // shipping-provider hiccup. Surface it, but let the order stand.
            console.log("⚠️  DHL shipment creation failed:", shipErr.message);
        }

        const profitSplit = calculateProfitSharing(total);
        const fraudFlag = detectFraud({ qty, total });

        const order = await OrderModel.create({
            productId,
            qty,
            total,
            customer,
            paymentId: payment.id,
            shippingTracking,
            profitSplit,
            fraudFlag
        });

        if (product.stock !== undefined) {
            product.stock -= qty;
            await product.save();
        }

        res.status(201).json(order);
    })
);

module.exports = router;
