const mongoose = require("mongoose");

async function connectDB() {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/classifyCommerce";

    try {
        await mongoose.connect(uri);
        console.log("📦 MongoDB Connected");
    } catch (err) {
        console.log("❌ DB Error:", err.message);
        console.log(
            "   → Check that MONGO_URI in your .env file points to a running MongoDB instance.\n" +
            "   → If you don't have MongoDB installed locally, use a free MongoDB Atlas cluster\n" +
            "     and paste its connection string into MONGO_URI (e.g. mongodb+srv://...)."
        );
        process.exit(1);
    }
}

module.exports = connectDB;
