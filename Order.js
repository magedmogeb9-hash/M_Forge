const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    productId: String,
    qty: Number,
    total: Number,
    customer: String,
    paymentId: String,
    shippingTracking: String,
    profitSplit: Object,
    fraudFlag: Boolean,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);
