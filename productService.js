const getProductModel = require('../models/Product');
const shopifyAdapter = require('./shopifyAdapter');

class ProductService {
  constructor(connection) {
    this.Product = getProductModel(connection);
  }

  async list({ page = 1, limit = 20, status } = {}) {
    const filter = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.Product.countDocuments(filter),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async getById(id) {
    return this.Product.findById(id);
  }

  async create(data) {
    const product = await this.Product.create(data);
    // مزامنة اختيارية مع Shopify - لا تفشل عملية الإنشاء المحلي لو Shopify غير مهيأ أو فشل الاتصال
    if (shopifyAdapter.isConfigured()) {
      try {
        const shopifyProduct = await shopifyAdapter.pushProduct(product);
        if (shopifyProduct) {
          product.externalId = String(shopifyProduct.id);
          await product.save();
        }
      } catch (err) {
        console.warn('⚠️ فشلت مزامنة Shopify (تم إنشاء المنتج محلياً فقط):', err.message);
      }
    }
    return product;
  }

  async update(id, data) {
    return this.Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async remove(id) {
    return this.Product.findByIdAndDelete(id);
  }

  // يجلب المنتجات مباشرة من Shopify للمقارنة أو الاستيراد اليدوي
  async fetchFromShopify(options) {
    return shopifyAdapter.fetchProducts(options);
  }
}

module.exports = ProductService;
