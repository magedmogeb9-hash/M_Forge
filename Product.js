const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        stock: { type: Number, default: 0, min: 0 },
        vendor: { type: String, default: "internal" },
        affiliateSource: { type: String, default: null }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
