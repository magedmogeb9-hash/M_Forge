const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'x', 'tiktok', 'linkedin'],
      required: true,
    },
    accountName: { type: String, required: true },
    externalAccountId: { type: String, required: true },
    // التوكنات تُخزَّن مشفّرة دائماً - راجع utils/encryption.js في وحدة البنوك (نفس النمط)
    accessTokenEncrypted: { type: String, required: true },
    refreshTokenEncrypted: { type: String },
    tokenExpiresAt: { type: Date },
    status: { type: String, enum: ['connected', 'expired', 'revoked'], default: 'connected' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ربط بمستخدم النواة المركزية
  },
  { timestamps: true }
);

module.exports = function getSocialAccountModel(connection) {
  return connection.model('SocialAccount', socialAccountSchema);
};
