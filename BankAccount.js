const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ['payoneer', 'paypal', 'wise', 'stripe'], required: true },
    accountLabel: { type: String, required: true }, // اسم وصفي فقط، مثل "حساب باي بال الرئيسي"
    // لا نخزن أبداً رقم حساب أو IBAN كامل بدون تشفير
    accountRefEncrypted: { type: String, required: true }, // معرف الحساب لدى المزود (مشفر)
    currency: { type: String, default: 'USD' },
    // الرصيد يُحدَّث فقط عبر مزامنة API رسمية - لا يُعدَّل يدوياً أبداً في الإنتاج
    lastKnownBalance: { type: Number, default: 0 },
    lastSyncedAt: { type: Date },
    status: { type: String, enum: ['active', 'disconnected', 'suspended'], default: 'active' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

module.exports = function getBankAccountModel(connection) {
  return connection.model('BankAccount', bankAccountSchema);
};
