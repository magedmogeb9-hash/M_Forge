require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cron = require("node-cron");

const connectDB = require("./config/db");
const { seedApiKeys } = require("./services/seedApiKeys");
const { syncAffiliateProducts } = require("./services/affiliateSync");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const apiKeyRoutes = require("./routes/apikeys");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Basic rate limiting to slow down brute-force / abuse attempts.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
});
app.use(apiLimiter);

// Health check — confirms the server is actually running and reachable.
app.get("/", (req, res) => {
    res.json({ status: "ok", service: "Classify AI Commerce OS", version: "2.0.0" });
});

app.use("/auth", authRoutes);
app.use("/apikeys", apiKeyRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/dashboard", dashboardRoutes);

// Unknown routes → clean 404 JSON instead of Express's default HTML page
app.use(notFound);

// Central error handler — must be registered last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
    await connectDB();
    await seedApiKeys();

    // Runs once a day at midnight
    cron.schedule("0 0 * * *", () => {
        syncAffiliateProducts();
    });

    app.listen(PORT, () => {
        console.log(`🚀 Classify AI Commerce OS running on port ${PORT}`);
    });
}

// Safety nets: log unexpected errors clearly instead of letting the process
// die silently or in a way that's hard to diagnose from hosting logs.
process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught exception:", err);
    process.exit(1);
});

start();
