const express = require('express');
const Joi = require('joi');
const router = express.Router();

const controller = require('../controllers/socialController');
const { authenticate, authorize } = require('../../../core/middleware/auth');

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    next();
  };
}

const connectSchema = Joi.object({
  platform: Joi.string().valid('facebook', 'instagram', 'x', 'tiktok', 'linkedin').required(),
  accountName: Joi.string().required(),
  externalAccountId: Joi.string().required(),
  accessToken: Joi.string().required(),
  refreshToken: Joi.string().allow(''),
  expiresAt: Joi.date(),
});

const postSchema = Joi.object({
  accountId: Joi.string().required(),
  content: Joi.string().max(5000).required(),
  mediaUrls: Joi.array().items(Joi.string().uri()),
  scheduledFor: Joi.date().required(),
});

// ==== الحسابات ====
router.post('/accounts', authenticate, authorize('owner', 'admin'), validate(connectSchema), controller.connectAccount);
router.get('/accounts', authenticate, controller.listAccounts);
router.delete('/accounts/:id', authenticate, authorize('owner', 'admin'), controller.revokeAccount);

// ==== المنشورات ====
router.post('/posts', authenticate, authorize('owner', 'admin', 'editor'), validate(postSchema), controller.schedulePost);
router.get('/posts', authenticate, controller.listPosts);

// نقطة داخلية لتنفيذ المنشورات المستحقة (تُحمى بمفتاح داخلي وليس صلاحية مستخدم عادي)
router.post('/posts/publish-due', authenticate, authorize('admin', 'system'), controller.publishDue);

module.exports = router;
