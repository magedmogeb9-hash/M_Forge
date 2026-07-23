const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    platform: { type: String, enum: ['meta', 'google', 'tiktok', 'snapchat'], required: true },
    objective: { type: String, enum: ['awareness', 'traffic', 'conversions', 'engagement'], required: true },
    budget: { type: Number, required: true, min: 0 },
    budgetType: { type: String, enum: ['daily', 'lifetime'], default: 'daily' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { type: String, enum: ['draft', 'active', 'paused', 'completed'], default: 'draft' },
    externalCampaignId: { type: String },
    targeting: {
      countries: [{ type: String }],
      ageMin: { type: Number },
      ageMax: { type: Number },
      interests: [{ type: String }],
    },
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      spend: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = function getCampaignModel(connection) {
  return connection.model('Campaign', campaignSchema);
};
