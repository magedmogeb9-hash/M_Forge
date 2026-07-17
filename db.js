const mongoose = require("mongoose");

async function connectDB() {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/classifyCommerce";

    try {
        await mongoose.connect(uri);
        console.log("📦 MongoDB Connected");
    } catch (err) {
        console.log("❌ DB Error:", err.message);
        process.exit(1);
    }
}

module.exports = connectDB;
