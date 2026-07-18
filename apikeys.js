const express = require("express");
const crypto = require("crypto");
const ApiKeyModel = require("../models/ApiKey");
const { verifyToken } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../utils/validate");

const router = express.Router();

// List all API keys (admin only). Key values are masked in the response.
router.get(
    "/",
    verifyToken,
    asyncHandler(async (req, res) => {
        const keys = await ApiKeyModel.find().select("platform active createdAt").sort({ createdAt: -1 });
        res.json(keys);
    })
);

// Create a new API key for a platform (admin only).
router.post(
    "/",
    verifyToken,
    asyncHandler(async (req, res) => {
        const errors = validateBody(req.body, { platform: { required: true, type: "string" } });
        if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

        const { platform } = req.body;
        const key = crypto.randomBytes(24).toString("hex");
        const apiKey = await ApiKeyModel.create({ platform, key, active: true });
        res.status(201).json(apiKey);
    })
);

// Revoke (deactivate) an API key (admin only).
router.patch(
    "/:id/revoke",
    verifyToken,
    asyncHandler(async (req, res) => {
        const apiKey = await ApiKeyModel.findByIdAndUpdate(
            req.params.id,
            { active: false },
            { new: true }
        );
        if (!apiKey) return res.status(404).json({ error: "API key not found" });
        res.json(apiKey);
    })
);

module.exports = router;
