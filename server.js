require("dotenv").config();

const express = require("express");
const cron = require("node-cron");

const connectDB = require("./config/db");
const { seedApiKeys } = require("./services/seedApiKeys");
const { syncAffiliateProducts } = require("./services/affiliateSync");

const authRoutes = require("./routes/auth");
const apiKeyRoutes = require("./routes/apikeys");
const orderRoutes = require("./routes/orders");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/apikeys", apiKeyRoutes);
app.use("/orders", orderRoutes);
app.use("/dashboard", dashboardRoutes);

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

start();
