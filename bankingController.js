const BankingService = require('../services/bankingService');

function getService(req) {
  return new BankingService(req.app.locals.bankingDb);
}

exports.linkAccount = async (req, res, next) => {
  try {
    const account = await getService(req).linkAccount({ ...req.body, ownerId: req.user.id });
    const safe = account.toObject();
    delete safe.accountRefEncrypted;
    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
};

exports.listAccounts = async (req, res, next) => {
  try {
    const accounts = await getService(req).listAccounts(req.user.id);
    res.json(accounts);
  } catch (err) {
    next(err);
  }
};

exports.disconnectAccount = async (req, res, next) => {
  try {
    const account = await getService(req).disconnectAccount(req.params.id);
    if (!account) return res.status(404).json({ error: 'الحساب غير موجود' });
    res.json({ message: 'تم فصل الحساب' });
  } catch (err) {
    next(err);
  }
};

exports.syncAccount = async (req, res, next) => {
  try {
    const account = await getService(req).syncAccount(req.params.id);
    await getService(req).flagSuspiciousTransactions(req.params.id);
    res.json(account);
  } catch (err) {
    next(err);
  }
};

exports.listTransactions = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await getService(req).listTransactions(req.params.id, {
      page: Number(page) || 1,
      limit: Number(limit) || 30,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
