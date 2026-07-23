const getCampaignModel = require('../models/Campaign');
const metaAdsAdapter = require('./metaAdsAdapter');

// Adapters لكل منصة إعلانية.
// Meta: تكامل حقيقي عبر Marketing API (الاستدعاء مجاني - التكلفة فقط عند تشغيل إنفاق فعلي)
// Google/TikTok/Snapchat: تتطلب حساب مطور معتمد لكل منصة - mock موثقة لحين ربطها بنفس النمط
const adPlatformAdapters = {
  meta: {
    createCampaign: async (data) => {
      if (!metaAdsAdapter.isConfigured()) {
        return { externalCampaignId: `unconfigured_meta_${Date.now()}` };
      }
      const res = await metaAdsAdapter.createCampaign({
        name: data.name,
        objective: data.objective.toUpperCase(),
        dailyBudgetCents: Math.round(data.budget * 100),
      });
      return { externalCampaignId: res.id };
    },
  },
  google: { createCampaign: async () => ({ externalCampaignId: `mock_google_${Date.now()}` }) },
  tiktok: { createCampaign: async () => ({ externalCampaignId: `mock_tiktok_${Date.now()}` }) },
  snapchat: { createCampaign: async () => ({ externalCampaignId: `mock_snap_${Date.now()}` }) },
};

class AdsService {
  constructor(connection) {
    this.Campaign = getCampaignModel(connection);
  }

  async createCampaign(data) {
    const adapter = adPlatformAdapters[data.platform];
    if (!adapter) throw Object.assign(new Error('منصة إعلانية غير مدعومة'), { status: 400 });

    const { externalCampaignId } = await adapter.createCampaign(data);
    return this.Campaign.create({ ...data, externalCampaignId });
  }

  async listCampaigns({ status, platform, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (platform) filter.platform = platform;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.Campaign.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.Campaign.countDocuments(filter),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async updateStatus(id, status) {
    return this.Campaign.findByIdAndUpdate(id, { status }, { new: true });
  }

  async updateMetrics(id, metrics) {
    return this.Campaign.findByIdAndUpdate(id, { $set: { metrics } }, { new: true });
  }

  // ملخص أداء بسيط لكل الحملات النشطة - مفيد لواجهة لوحة التحكم
  async performanceSummary() {
    const active = await this.Campaign.find({ status: 'active' });
    return active.reduce(
      (acc, c) => {
        acc.totalSpend += c.metrics.spend || 0;
        acc.totalImpressions += c.metrics.impressions || 0;
        acc.totalClicks += c.metrics.clicks || 0;
        acc.totalConversions += c.metrics.conversions || 0;
        return acc;
      },
      { totalSpend: 0, totalImpressions: 0, totalClicks: 0, totalConversions: 0, campaignCount: active.length }
    );
  }
}

module.exports = AdsService;
