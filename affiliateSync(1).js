const axios = require("axios");
const ProductModel = require("../models/Product");
const ApiKeyModel = require("../models/ApiKey");

async function syncPlatform(platformName, url) {
    const apiKey = await ApiKeyModel.findOne({ platform: platformName, active: true });
    if (!apiKey) return { platform: platformName, skipped: true, reason: "no API key configured" };

    const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${apiKey.key}` },
        timeout: 10000
    });

    let count = 0;
    for (const p of response.data) {
        await ProductModel.updateOne(
            { name: p.name, vendor: platformName },
            { $set: { price: p.price, stock: p.stock, affiliateSource: platformName } },
            { upsert: true }
        );
        count++;
    }
    return { platform: platformName, imported: count };
}

async function syncAffiliateProducts() {
    console.log("🔄 Running Affiliate Auto-Sync...");

    const targets = [
        ["Amazon", "https://api.amazon.com/affiliate/products"],
        ["Alibaba", "https://api.alibaba.com/affiliate/products"]
    ];

    for (const [platform, url] of targets) {
        try {
            const result = await syncPlatform(platform, url);
            if (result.skipped) {
                console.log(`ℹ️  ${platform}: skipped (${result.reason})`);
            } else {
                console.log(`✅ ${platform}: synced ${result.imported} product(s)`);
            }
        } catch (err) {
            // One platform failing (bad key, network error, placeholder URL, etc.)
            // should never stop the others from syncing.
            console.log(`❌ ${platform} sync failed:`, err.message);
        }
    }

    console.log("✅ Affiliate Sync Completed.");
}

module.exports = { syncAffiliateProducts };
