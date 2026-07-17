const express = require("express");
const axios = require("axios");
const Stripe = require("stripe");
const ProductModel = require("../models/Product");
const OrderModel = require("../models/Order");
const { checkApiKey } = require("../middleware/auth");
const { calculateProfitSharing } = require("../services/profitSharing");
const { detectFraud } = require("../services/fraudDetection");

const router = express.Router();

// Lazily create the Stripe client the first time it's actually needed,
// instead of at server startup. This means a missing STRIPE_SECRET_KEY
// only breaks the /orders endpoint (with a clear error) instead of
// crashing the entire server before it can even start listening.
let stripeClient = null;
function getStripeClient() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not set. Add it to your .env file.");
    }
    if (!stripeClient) {
        stripeClient = Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripeClient;
}

router.post("/", checkApiKey, async (req, res) => {
    try {
        const { productId, qty, customer, cardToken } = req.body;

        const product = await ProductModel.findById(productId);
        if (!product) return res.status(404).json({ error: "Product not found" });

        const total = product.price * qty;

        const stripe = getStripeClient();
        const payment = await stripe.paymentIntents.create({
            amount: Math.round(total * 100),
            currency: "usd",
            payment_method: cardToken,
            confirm: true
        });

        const shipping = await axios.post(
            "https://api.dhl.com/shipments",
            { to: customer, weight: qty, product: product.name },
            { headers: { "DHL-API-Key": process.env.DHL_API_KEY } }
        );

        const profitSplit = calculateProfitSharing(total);
        const fraudFlag = detectFraud({ qty, total });

        const order = await OrderModel.create({
            productId,
            qty,
            total,
            customer,
            paymentId: payment.id,
            shippingTracking: shipping.data.trackingNumber,
            profitSplit,
            fraudFlag
        });

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: "Order creation failed", details: err.message });
    }
});

module.exports = router;
