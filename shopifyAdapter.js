const { request } = require('../../../core/utils/httpClient');
const config = require('../../../core/config/env');

/**
 * Shopify Admin REST API - مجاني تماماً للاستدعاء (يحتاج فقط متجر Shopify، حتى متجر تطوير مجاني)
 * التوثيق: https://shopify.dev/docs/api/admin-rest
 * يتطلب: SHOPIFY_STORE_DOMAIN + SHOPIFY_API_KEY (Admin API access token) في .env
 */

function isConfigured() {
  return Boolean(config.shopify.storeDomain && config.shopify.apiKey);
}

function baseUrl() {
  return `https://${config.shopify.storeDomain}/admin/api/2024-07`;
}

function headers() {
  return { 'X-Shopify-Access-Token': config.shopify.apiKey, 'Content-Type': 'application/json' };
}

// يجلب المنتجات مباشرة من Shopify (مصدر الحقيقة الفعلي لمتجرك)
async function fetchProducts({ limit = 50 } = {}) {
  if (!isConfigured()) return null; // الوحدة تعمل محلياً بدون Shopify إذا لم تُهيَّأ الإعدادات
  const data = await request({ method: 'GET', url: `${baseUrl()}/products.json?limit=${limit}`, headers: headers() });
  return data.products;
}

// يرفع منتج من قاعدتنا الداخلية إلى Shopify (مزامنة باتجاه واحد كمثال أولي)
async function pushProduct(product) {
  if (!isConfigured()) return null;
  const payload = {
    product: {
      title: product.title,
      body_html: product.description,
      variants: [{ price: String(product.price), sku: product.sku, inventory_quantity: product.stock }],
      status: product.status === 'active' ? 'active' : 'draft',
      images: (product.images || []).map((src) => ({ src })),
    },
  };
  const data = await request({ method: 'POST', url: `${baseUrl()}/products.json`, headers: headers(), data: payload });
  return data.product;
}

module.exports = { isConfigured, fetchProducts, pushProduct };
