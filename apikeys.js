const express = require("express");
const crypto = require("crypto");
const ApiKeyModel = require("../models/ApiKey");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// Protected: only an authenticated admin can mint new API keys
router.post("/", verifyToken, async (req, res) => {
    const { platform } = req.body;
    if (!platform) return res.status(400).json({ error: "platform is required" });

    const key = crypto.randomBytes(24).toString("hex");
    const apiKey = await ApiKeyModel.create({ platform, key, active: true });
    res.json(apiKey);
});

module.exports = router;
