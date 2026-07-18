const mongoose = require("mongoose");

const ApiKeySchema = new mongoose.Schema(
    {
        platform: { type: String, required: true },
        key: { type: String, required: true },
        active: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("ApiKey", ApiKeySchema);
