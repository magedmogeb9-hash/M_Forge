const express = require('express');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const controller = require('../controllers/aiTrainerController');
const { authenticate, authorize } = require('../../../core/middleware/auth');

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    next();
  };
}

// حد صارم على تنفيذ الكود - يمنع إساءة الاستخدام لاستهلاك موارد الخادم
const executeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'عدد كبير من محاولات التنفيذ، حاول بعد قليل' },
});

const skillSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  code: Joi.string().max(20000).required(),
});

// ⚠️ كل مسارات هذه الوحدة مقصورة على owner فقط - أي كود يُنفَّذ هنا يمكنه التأثير على الخادم
// اقتراح كود عبر Hugging Face المجاني - قبل إنشاء المهارة رسمياً
router.post('/skills/suggest', authenticate, authorize('owner'), controller.suggestCode);

router.post('/skills', authenticate, authorize('owner'), validate(skillSchema), controller.createSkill);
router.get('/skills', authenticate, authorize('owner'), controller.listSkills);
router.get('/skills/:id', authenticate, authorize('owner'), controller.getSkill);
router.put('/skills/:id/code', authenticate, authorize('owner'), controller.updateCode);
router.delete('/skills/:id', authenticate, authorize('owner'), controller.deleteSkill);

// نافذة الأمر (تنفيذ الكود) - نقطة النهاية الأكثر حساسية في كل المنصة
router.post('/skills/:id/test', authenticate, authorize('owner'), executeLimiter, controller.testSkill);
router.patch('/skills/:id/enable', authenticate, authorize('owner'), controller.enableSkill);
router.patch('/skills/:id/disable', authenticate, authorize('owner'), controller.disableSkill);

module.exports = router;
