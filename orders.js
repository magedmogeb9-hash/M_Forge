const express = require("express");
const axios = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ProductModel = require("../models/Product");
const OrderModel = require("../models/Order");
const { checkApiKey } = require("../middleware/auth");
const { calculateProfitSharing } = require("../services/profitSharing");
const { detectFraud } = require("../services/fraudDetection");

const router = express.Router();

router.post("/", checkApiKey, async (req, res) => {
    try {
        const { productId, qty, customer, cardToken } = req.body;

        const product = await ProductModel.findById(productId);
        if (!product) return res.status(404).json({ error: "Product not found" });

        const total = product.price * qty;

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
