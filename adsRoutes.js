const express = require('express');
const Joi = require('joi');
const router = express.Router();

const controller = require('../controllers/adsController');
const { authenticate, authorize } = require('../../../core/middleware/auth');

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    next();
  };
}

const campaignSchema = Joi.object({
  name: Joi.string().required(),
  platform: Joi.string().valid('meta', 'google', 'tiktok', 'snapchat').required(),
  objective: Joi.string().valid('awareness', 'traffic', 'conversions', 'engagement').required(),
  budget: Joi.number().min(0).required(),
  budgetType: Joi.string().valid('daily', 'lifetime'),
  startDate: Joi.date().required(),
  endDate: Joi.date(),
  targeting: Joi.object({
    countries: Joi.array().items(Joi.string()),
    ageMin: Joi.number(),
    ageMax: Joi.number(),
    interests: Joi.array().items(Joi.string()),
  }),
});

const trendSchema = Joi.object({
  keyword: Joi.string().required(),
  region: Joi.string(),
  source: Joi.string().valid('google_trends', 'x_trends', 'tiktok_trends', 'manual').required(),
  score: Joi.number().min(0).max(100),
  relatedTerms: Joi.array().items(Joi.string()),
});

// ==== حملات ====
router.post('/campaigns', authenticate, authorize('owner', 'admin'), validate(campaignSchema), controller.createCampaign);
router.get('/campaigns', authenticate, controller.listCampaigns);
router.patch('/campaigns/:id/status', authenticate, authorize('owner', 'admin'), controller.updateCampaignStatus);
router.get('/campaigns/performance', authenticate, controller.performanceSummary);

// ==== ترندات ====
router.post('/trends', authenticate, authorize('owner', 'admin', 'system'), validate(trendSchema), controller.recordTrend);
router.get('/trends/live', authenticate, controller.fetchLiveTrend);
router.get('/trends/top', authenticate, controller.topTrends);
router.get('/trends/:keyword/history', authenticate, controller.trendHistory);

module.exports = router;
