const ApiKeyModel = require("../models/ApiKey");

async function seedApiKeys() {
    const platforms = [
        { platform: "Amazon", key: process.env.API_KEY_AMAZON },
        { platform: "Alibaba", key: process.env.API_KEY_ALIBABA },
        { platform: "AliExpress", key: process.env.API_KEY_ALIEXPRESS },
        { platform: "Shein", key: process.env.API_KEY_SHEIN },
        { platform: "eBay", key: process.env.API_KEY_EBAY },
        { platform: "Walmart", key: process.env.API_KEY_WALMART },
        { platform: "Etsy", key: process.env.API_KEY_ETSY },
        { platform: "Rakuten", key: process.env.API_KEY_RAKUTEN },
        { platform: "Shopify", key: process.env.API_KEY_SHOPIFY },
        { platform: "JD.com", key: process.env.API_KEY_JDCOM }
    ];

    for (let p of platforms) {
        if (!p.key) continue; // skip platforms without a configured key
        await ApiKeyModel.updateOne(
            { platform: p.platform },
            { $set: { key: p.key, active: true } },
            { upsert: true }
        );
    }
    console.log("✅ API Keys Seeded for configured platforms");
}

module.exports = { seedApiKeys };
