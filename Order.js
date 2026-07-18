const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true, min: 1 },
    total: Number,
    customer: String,
    paymentId: String,
    shippingTracking: String,
    profitSplit: {
        platformShare: Number,
        storeShare: Number
    },
    fraudFlag: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);
