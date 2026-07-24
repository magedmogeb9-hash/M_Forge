const express = require('express');
const Joi = require('joi');
const router = express.Router();

const controller = require('../controllers/bankingController');
const { authenticate, authorize } = require('../../../core/middleware/auth');

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    next();
  };
}

const linkSchema = Joi.object({
  provider: Joi.string().valid('payoneer', 'paypal', 'wise', 'stripe').required(),
  accountLabel: Joi.string().required(),
  accountRef: Joi.string().required(), // معرف الحساب لدى المزود - يُشفَّر فوراً قبل التخزين
  currency: Joi.string().default('USD'),
});

// كل مسارات هذه الوحدة مقصورة على owner/admin فقط - لا يوجد دور "editor" هنا إطلاقاً
router.post('/accounts', authenticate, authorize('owner', 'admin'), validate(linkSchema), controller.linkAccount);
router.get('/accounts', authenticate, authorize('owner', 'admin'), controller.listAccounts);
router.delete('/accounts/:id', authenticate, authorize('owner', 'admin'), controller.disconnectAccount);

router.post('/accounts/:id/sync', authenticate, authorize('owner', 'admin', 'system'), controller.syncAccount);
router.get('/accounts/:id/transactions', authenticate, authorize('owner', 'admin'), controller.listTransactions);

module.exports = router;
