const AdsService = require('../services/adsService');
const TrendsService = require('../services/trendsService');

function getAdsService(req) {
  return new AdsService(req.app.locals.adsDb);
}
function getTrendsService(req) {
  return new TrendsService(req.app.locals.adsDb);
}

// ==== حملات إعلانية ====
exports.createCampaign = async (req, res, next) => {
  try {
    const campaign = await getAdsService(req).createCampaign(req.body);
    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
};

exports.listCampaigns = async (req, res, next) => {
  try {
    const { status, platform, page, limit } = req.query;
    const result = await getAdsService(req).listCampaigns({
      status,
      platform,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateCampaignStatus = async (req, res, next) => {
  try {
    const campaign = await getAdsService(req).updateStatus(req.params.id, req.body.status);
    if (!campaign) return res.status(404).json({ error: 'الحملة غير موجودة' });
    res.json(campaign);
  } catch (err) {
    next(err);
  }
};

exports.performanceSummary = async (req, res, next) => {
  try {
    const summary = await getAdsService(req).performanceSummary();
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

// ==== الترندات ====
exports.recordTrend = async (req, res, next) => {
  try {
    const trend = await getTrendsService(req).recordSnapshot(req.body);
    res.status(201).json(trend);
  } catch (err) {
    next(err);
  }
};

// يجلب بيانات حقيقية من Google Trends مباشرة (مجاني) ويخزنها
exports.fetchLiveTrend = async (req, res, next) => {
  try {
    const { keyword, geo } = req.query;
    if (!keyword) return res.status(400).json({ error: 'يجب تحديد keyword' });
    const trend = await getTrendsService(req).fetchAndRecordLive({ keyword, geo });
    res.status(201).json(trend);
  } catch (err) {
    next(err);
  }
};

exports.topTrends = async (req, res, next) => {
  try {
    const { region, limit } = req.query;
    const trends = await getTrendsService(req).getTopTrends({ region, limit: Number(limit) || 10 });
    res.json(trends);
  } catch (err) {
    next(err);
  }
};

exports.trendHistory = async (req, res, next) => {
  try {
    const trends = await getTrendsService(req).getTrendHistory(req.params.keyword, {
      limit: Number(req.query.limit) || 30,
    });
    res.json(trends);
  } catch (err) {
    next(err);
  }
};
