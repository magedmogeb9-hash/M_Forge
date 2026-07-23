const express = require('express');
const Joi = require('joi');
const router = express.Router();

const controller = require('../controllers/productController');
const { authenticate, authorize } = require('../../../core/middleware/auth');

// تحقق بسيط من صحة البيانات قبل ما توصل للـ controller
function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    next();
  };
}

const productSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  price: Joi.number().min(0).required(),
  currency: Joi.string().default('USD'),
  stock: Joi.number().min(0).default(0),
  sku: Joi.string().allow(''),
  images: Joi.array().items(Joi.string().uri()),
  status: Joi.string().valid('active', 'draft', 'archived'),
});

// القراءة متاحة لأي مستخدم مسجل دخول (owner/staff)
router.get('/', authenticate, controller.listProducts);
router.get('/shopify/live', authenticate, authorize('owner', 'admin'), controller.fetchFromShopify);
router.get('/:id', authenticate, controller.getProduct);

// الكتابة تحتاج صلاحية owner أو admin فقط
router.post('/', authenticate, authorize('owner', 'admin'), validate(productSchema), controller.createProduct);
router.put('/:id', authenticate, authorize('owner', 'admin'), validate(productSchema), controller.updateProduct);
router.delete('/:id', authenticate, authorize('owner', 'admin'), controller.deleteProduct);

module.exports = router;
