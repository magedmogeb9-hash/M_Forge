const mongoose = require('mongoose');

const scheduledPostSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'SocialAccount', required: true },
    platform: { type: String, required: true },
    content: { type: String, required: true },
    mediaUrls: [{ type: String }],
    scheduledFor: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'publishing', 'published', 'failed'],
      default: 'pending',
    },
    publishedAt: { type: Date },
    externalPostId: { type: String },
    errorMessage: { type: String },
    // إحصائيات بعد النشر (تُحدَّث لاحقاً عبر مهمة دورية)
    metrics: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

scheduledPostSchema.index({ status: 1, scheduledFor: 1 });

module.exports = function getScheduledPostModel(connection) {
  return connection.model('ScheduledPost', scheduledPostSchema);
};
