const getBankAccountModel = require('../models/BankAccount');
const getTransactionModel = require('../models/Transaction');
const { encrypt } = require('../../../core/utils/encryption');
const paypalAdapter = require('./paypalAdapter');

/**
 * ملاحظة تصميم مهمة:
 * هذه الوحدة مبنية كـ "مزامنة ومراقبة" فقط (sync & monitor) وليست وحدة تحويل أموال مباشر.
 * أي عملية تحويل فعلية (payout/transfer) يجب أن تتم عبر الواجهة الرسمية المعتمدة
 * لكل مزود (Payoneer/PayPal Payouts API) مباشرة من الخادم بعد التحقق الكامل (KYC/2FA)،
 * وليس عبر منطق مخصص هنا. هذا يقلل من مخاطر الأمان والامتثال (PCI-DSS).
 *
 * PayPal: تكامل حقيقي عبر PayPal Sandbox (مجاني بالكامل لأي حساب مطور - developer.paypal.com)
 * Payoneer/Wise/Stripe: لا تتوفر بيئة sandbox عامة مجانية بنفس سهولة PayPal - mock موثقة لحين توفر اعتماد تجاري
 */
const providerAdapters = {
  paypal: {
    fetchBalance: () => paypalAdapter.fetchBalance(),
    fetchTransactions: () => {
      const end = new Date();
      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // آخر 30 يوم
      return paypalAdapter.fetchTransactions({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
    },
  },
  payoneer: { fetchBalance: async () => 0, fetchTransactions: async () => [] },
  wise: { fetchBalance: async () => 0, fetchTransactions: async () => [] },
  stripe: { fetchBalance: async () => 0, fetchTransactions: async () => [] },
};

class BankingService {
  constructor(connection) {
    this.Account = getBankAccountModel(connection);
    this.Transaction = getTransactionModel(connection);
  }

  async linkAccount({ provider, accountLabel, accountRef, currency, ownerId }) {
    if (!providerAdapters[provider]) {
      throw Object.assign(new Error('مزود غير مدعوم'), { status: 400 });
    }
    return this.Account.create({
      provider,
      accountLabel,
      accountRefEncrypted: encrypt(accountRef),
      currency,
      ownerId,
    });
  }

  async listAccounts(ownerId) {
    return this.Account.find({ ownerId }).select('-accountRefEncrypted');
  }

  async disconnectAccount(id) {
    return this.Account.findByIdAndUpdate(id, { status: 'disconnected' }, { new: true });
  }

  // مزامنة دورية (تُستدعى من مهمة مجدولة) - تجلب فقط، لا تُرسل أي أموال
  async syncAccount(id) {
    const account = await this.Account.findById(id);
    if (!account) throw Object.assign(new Error('الحساب غير موجود'), { status: 404 });

    const adapter = providerAdapters[account.provider];
    const [balance, transactions] = await Promise.all([
      adapter.fetchBalance(account),
      adapter.fetchTransactions(account),
    ]);

    for (const tx of transactions) {
      await this.Transaction.updateOne(
        { externalTransactionId: tx.externalTransactionId },
        { $setOnInsert: { ...tx, accountId: account._id } },
        { upsert: true }
      );
    }

    account.lastKnownBalance = balance;
    account.lastSyncedAt = new Date();
    await account.save();
    return account;
  }

  async listTransactions(accountId, { page = 1, limit = 30 } = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.Transaction.find({ accountId }).sort({ occurredAt: -1 }).skip(skip).limit(limit),
      this.Transaction.countDocuments({ accountId }),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  // فحص بسيط للمعاملات المشبوهة (يُستدعى بعد كل مزامنة) - قواعد أولية قابلة للتوسعة
  async flagSuspiciousTransactions(accountId, { largeAmountThreshold = 5000 } = {}) {
    const candidates = await this.Transaction.find({
      accountId,
      flaggedSuspicious: false,
      amount: { $gte: largeAmountThreshold },
    });

    for (const tx of candidates) {
      tx.flaggedSuspicious = true;
      tx.flagReason = `مبلغ كبير غير معتاد (>= ${largeAmountThreshold})`;
      await tx.save();
    }
    return candidates.length;
  }
}

module.exports = BankingService;
