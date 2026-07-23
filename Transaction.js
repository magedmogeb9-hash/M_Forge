const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount', required: true },
    externalTransactionId: { type: String, required: true, unique: true }, // من المزود - يمنع التكرار
    type: { type: String, enum: ['credit', 'debit', 'fee', 'transfer'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    description: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'reversed'], default: 'completed' },
    occurredAt: { type: Date, required: true },
    // علم على العمليات المشبوهة - يُحدَّث من محرك كشف الاحتيال (خارج نطاق هذا الملف)
    flaggedSuspicious: { type: Boolean, default: false },
    flagReason: { type: String },
  },
  { timestamps: true }
);

transactionSchema.index({ accountId: 1, occurredAt: -1 });

module.exports = function getTransactionModel(connection) {
  return connection.model('Transaction', transactionSchema);
};
