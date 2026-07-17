const express = require("express");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * NOTE: This uses a single admin account defined via environment variables
 * as a minimal replacement for a hardcoded username/password. For real
 * production use, replace this with a proper Users collection + hashed
 * passwords per user.
 */
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const adminUser = process.env.ADMIN_USERNAME;
    const adminHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminUser || !adminHash) {
        return res.status(500).json({ error: "Admin credentials not configured on the server" });
    }

    if (username !== adminUser) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password || "", adminHash);
    if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({ username });
    res.json({ token });
});

module.exports = router;
