const getTrendSnapshotModel = require('../models/TrendSnapshot');
const googleTrendsAdapter = require('./googleTrendsAdapter');

class TrendsService {
  constructor(connection) {
    this.Trend = getTrendSnapshotModel(connection);
  }

  // تسجيل يدوي أو من مصدر خارجي جاهز مسبقاً
  async recordSnapshot({ keyword, region, source, score, relatedTerms }) {
    return this.Trend.create({ keyword, region, source, score, relatedTerms });
  }

  // يجلب بيانات حقيقية من Google Trends (مجاني بالكامل) ويخزنها كلقطة جديدة
  async fetchAndRecordLive({ keyword, geo = '' }) {
    const [{ score, relatedTerms: _unused }, relatedTerms] = await Promise.all([
      googleTrendsAdapter.fetchInterestOverTime({ keyword, geo }),
      googleTrendsAdapter.fetchRelatedQueries({ keyword, geo }).catch(() => []),
    ]);
    return this.recordSnapshot({
      keyword,
      region: geo || 'global',
      source: 'google_trends',
      score,
      relatedTerms,
    });
  }

  async getTrendHistory(keyword, { limit = 30 } = {}) {
    return this.Trend.find({ keyword }).sort({ capturedAt: -1 }).limit(limit);
  }

  async getTopTrends({ region = 'global', limit = 10 } = {}) {
    // آخر لقطة لكل كلمة مفتاحية، مرتبة حسب الشعبية
    return this.Trend.aggregate([
      { $match: { region } },
      { $sort: { capturedAt: -1 } },
      { $group: { _id: '$keyword', latest: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$latest' } },
      { $sort: { score: -1 } },
      { $limit: limit },
    ]);
  }
}

module.exports = TrendsService;
