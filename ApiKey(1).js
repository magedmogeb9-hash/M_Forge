const mongoose = require("mongoose");

const ApiKeySchema = new mongoose.Schema({
    platform: String,
    key: String,
    active: Boolean
});

module.exports = mongoose.model("ApiKey", ApiKeySchema);
