const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    stock: Number,
    vendor: String,
    affiliateSource: String
});

module.exports = mongoose.model("Product", ProductSchema);
