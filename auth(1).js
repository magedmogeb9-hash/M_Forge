const express = require("express");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { validateBody } = require("../utils/validate");

const router = express.Router();

/**
 * Single admin account via environment variables. For multi-user auth,
 * replace this with a real Users collection with per-user hashed passwords.
 */
router.post(
    "/login",
    asyncHandler(async (req, res) => {
        const errors = validateBody(req.body, {
            username: { required: true, type: "string" },
            password: { required: true, type: "string" }
        });
        if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

        const { username, password } = req.body;
        const adminUser = process.env.ADMIN_USERNAME;
        const adminHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminUser || !adminHash) {
            return res.status(500).json({ error: "Admin credentials not configured on the server" });
        }

        if (username !== adminUser) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, adminHash);
        if (!valid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken({ username });
        res.json({ token });
    })
);

module.exports = router;
