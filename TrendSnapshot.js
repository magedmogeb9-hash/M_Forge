const mongoose = require('mongoose');

const trendSnapshotSchema = new mongoose.Schema(
  {
    keyword: { type: String, required: true },
    region: { type: String, default: 'global' },
    source: { type: String, enum: ['google_trends', 'x_trends', 'tiktok_trends', 'manual'], required: true },
    score: { type: Number, min: 0, max: 100 }, // مقياس شعبية موحّد 0-100
    relatedTerms: [{ type: String }],
    capturedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

trendSnapshotSchema.index({ keyword: 1, capturedAt: -1 });

module.exports = function getTrendSnapshotModel(connection) {
  return connection.model('TrendSnapshot', trendSnapshotSchema);
};
