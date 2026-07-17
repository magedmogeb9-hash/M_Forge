const express = require("express");
const OrderModel = require("../models/Order");
const { checkApiKey } = require("../middleware/auth");

const router = express.Router();

router.get("/profits", checkApiKey, async (req, res) => {
    const orders = await OrderModel.find();
    let totalPlatform = 0;
    let totalStores = 0;
    let fraudCases = 0;
    const monthlyData = {};

    for (let o of orders) {
        totalPlatform += o.profitSplit.platformShare;
        totalStores += o.profitSplit.storeShare;
        if (o.fraudFlag) fraudCases++;

        const month = new Date(o.createdAt).getMonth();
        if (!monthlyData[month]) monthlyData[month] = { platform: 0, stores: 0 };
        monthlyData[month].platform += o.profitSplit.platformShare;
        monthlyData[month].stores += o.profitSplit.storeShare;
    }

    res.json({
        totalOrders: orders.length,
        platformProfit: totalPlatform,
        storesProfit: totalStores,
        fraudCases,
        monthlyData
    });
});

module.exports = router;
