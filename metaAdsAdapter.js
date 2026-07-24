const { request } = require('../../../core/utils/httpClient');
const config = require('../../../core/config/env');

/**
 * Meta Marketing API - الاستدعاء مجاني (التكلفة فقط على الإنفاق الإعلاني الفعلي عند التشغيل)
 * يتطلب: حساب إعلانات Meta + Access Token بصلاحية ads_management
 * التوثيق: https://developers.facebook.com/docs/marketing-apis
 */
const GRAPH_VERSION = 'v20.0';
const BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

function isConfigured() {
  return Boolean(config.metaAds?.accessToken && config.metaAds?.adAccountId);
}

// ينشئ حملة بحالة PAUSED افتراضياً كإجراء أمان - لا تُفعَّل تلقائياً بدون مراجعة بشرية
async function createCampaign({ name, objective, dailyBudgetCents }) {
  if (!isConfigured()) return null;
  return request({
    method: 'POST',
    url: `${BASE_URL}/act_${config.metaAds.adAccountId}/campaigns`,
    data: {
      name,
      objective,
      status: 'PAUSED',
      daily_budget: dailyBudgetCents,
      special_ad_categories: [],
      access_token: config.metaAds.accessToken,
    },
  });
}

async function fetchCampaignInsights(externalCampaignId) {
  if (!isConfigured()) return null;
  return request({
    method: 'GET',
    url: `${BASE_URL}/${externalCampaignId}/insights?fields=impressions,clicks,spend,conversions&access_token=${config.metaAds.accessToken}`,
  });
}

module.exports = { isConfigured, createCampaign, fetchCampaignInsights };
