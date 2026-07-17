const axios = require("axios");
const ProductModel = require("../models/Product");
const ApiKeyModel = require("../models/ApiKey");

async function syncAffiliateProducts() {
    console.log("🔄 Running Affiliate Auto-Sync...");

    try {
        const amazonKey = await ApiKeyModel.findOne({ platform: "Amazon", active: true });
        const alibabaKey = await ApiKeyModel.findOne({ platform: "Alibaba", active: true });

        if (amazonKey) {
            const amazonProducts = await axios.get("https://api.amazon.com/affiliate/products", {
                headers: { Authorization: `Bearer ${amazonKey.key}` }
            });
            for (let p of amazonProducts.data) {
                await ProductModel.updateOne(
                    { name: p.name, vendor: "Amazon" },
                    { $set: { price: p.price, stock: p.stock, affiliateSource: "Amazon" } },
                    { upsert: true }
                );
            }
        }

        if (alibabaKey) {
            const alibabaProducts = await axios.get("https://api.alibaba.com/affiliate/products", {
                headers: { Authorization: `Bearer ${alibabaKey.key}` }
            });
            for (let p of alibabaProducts.data) {
                await ProductModel.updateOne(
                    { name: p.name, vendor: "Alibaba" },
                    { $set: { price: p.price, stock: p.stock, affiliateSource: "Alibaba" } },
                    { upsert: true }
                );
            }
        }

        console.log("✅ Affiliate Sync Completed.");
    } catch (err) {
        console.log("❌ Affiliate Sync Error:", err.message);
    }
}

module.exports = { syncAffiliateProducts };
