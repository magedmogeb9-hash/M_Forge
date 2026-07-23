const ProductService = require('../services/productService');

// كل دالة تأخذ الاتصال (connection) من req.app.locals لضمان عزل قاعدة بيانات الإيكوميرس
function getService(req) {
  return new ProductService(req.app.locals.ecommerceDb);
}

exports.listProducts = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const result = await getService(req).list({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      status,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await getService(req).getById(req.params.id);
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await getService(req).create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await getService(req).update(req.params.id, req.body);
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await getService(req).remove(req.params.id);
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json({ message: 'تم حذف المنتج' });
  } catch (err) {
    next(err);
  }
};

exports.fetchFromShopify = async (req, res, next) => {
  try {
    const products = await getService(req).fetchFromShopify({ limit: Number(req.query.limit) || 50 });
    if (products === null) {
      return res.status(400).json({ error: 'Shopify غير مهيأ - أضف SHOPIFY_STORE_DOMAIN و SHOPIFY_API_KEY في .env' });
    }
    res.json(products);
  } catch (err) {
    next(err);
  }
};
