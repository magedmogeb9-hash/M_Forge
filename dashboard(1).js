const express = require("express");
const OrderModel = require("../models/Order");
const { checkApiKey } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get(
    "/profits",
    checkApiKey,
    asyncHandler(async (req, res) => {
        const orders = await OrderModel.find();
        let totalPlatform = 0;
        let totalStores = 0;
        let fraudCases = 0;
        const monthlyData = {};

        for (const o of orders) {
            const split = o.profitSplit || { platformShare: 0, storeShare: 0 };
            totalPlatform += split.platformShare || 0;
            totalStores += split.storeShare || 0;
            if (o.fraudFlag) fraudCases++;

            const month = new Date(o.createdAt).getMonth();
            if (!monthlyData[month]) monthlyData[month] = { platform: 0, stores: 0 };
            monthlyData[month].platform += split.platformShare || 0;
            monthlyData[month].stores += split.storeShare || 0;
        }

        res.json({
            totalOrders: orders.length,
            platformProfit: totalPlatform,
            storesProfit: totalStores,
            fraudCases,
            monthlyData
        });
    })
);

module.exports = router;
