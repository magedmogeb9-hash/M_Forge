const googleTrends = require('google-trends-api');

/**
 * Google Trends - لا يوجد API رسمي، لكن مكتبة google-trends-api مجانية بالكامل
 * ولا تحتاج مفتاح API إطلاقاً (تستخدم نفس البيانات العامة من trends.google.com)
 */

// يجلب اهتمام حقيقي بكلمة مفتاحية عبر الزمن (0-100) لمنطقة معينة
async function fetchInterestOverTime({ keyword, geo = '' }) {
  const raw = await googleTrends.interestOverTime({ keyword, geo });
  const parsed = JSON.parse(raw);
  const points = parsed.default.timelineData || [];
  if (!points.length) return { score: 0, relatedTerms: [] };

  const latest = points[points.length - 1];
  return { score: latest.value?.[0] ?? 0, relatedTerms: [] };
}

// يجلب مواضيع مرتبطة حقيقية بكلمة مفتاحية معينة
async function fetchRelatedQueries({ keyword, geo = '' }) {
  const raw = await googleTrends.relatedQueries({ keyword, geo });
  const parsed = JSON.parse(raw);
  const rankedList = parsed.default?.rankedList?.[0]?.rankedKeyword || [];
  return rankedList.slice(0, 10).map((item) => item.query);
}

module.exports = { fetchInterestOverTime, fetchRelatedQueries };
