const SocialService = require('../services/socialService');

function getService(req) {
  return new SocialService(req.app.locals.socialDb);
}

exports.connectAccount = async (req, res, next) => {
  try {
    const account = await getService(req).connectAccount({ ...req.body, ownerId: req.user.id });
    const safe = account.toObject();
    delete safe.accessTokenEncrypted;
    delete safe.refreshTokenEncrypted;
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

exports.revokeAccount = async (req, res, next) => {
  try {
    const account = await getService(req).revokeAccount(req.params.id);
    if (!account) return res.status(404).json({ error: 'الحساب غير موجود' });
    res.json({ message: 'تم إلغاء ربط الحساب' });
  } catch (err) {
    next(err);
  }
};

exports.schedulePost = async (req, res, next) => {
  try {
    const post = await getService(req).schedulePost(req.body);
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

exports.listPosts = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await getService(req).listPosts({ status, page: Number(page) || 1, limit: Number(limit) || 20 });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// نقطة نهاية يستدعيها cron job خارجي أو مجدول داخلي كل دقيقة
exports.publishDue = async (req, res, next) => {
  try {
    const results = await getService(req).publishDuePosts();
    res.json({ processed: results.length, results });
  } catch (err) {
    next(err);
  }
};
