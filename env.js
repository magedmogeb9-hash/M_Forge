require('dotenv').config();

// نقطة مركزية واحدة لقراءة متغيرات البيئة
// أي وحدة تحتاج إعداد جديد تضيفه هنا فقط، ولا تقرأ process.env مباشرة في أي مكان آخر
module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  mongo: {
    core: process.env.MONGO_URI_CORE,
    ecommerce: process.env.MONGO_URI_ECOMMERCE,
    social: process.env.MONGO_URI_SOCIAL,
    ads: process.env.MONGO_URI_ADS,
    banking: process.env.MONGO_URI_BANKING,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
  },

  encryptionKey: process.env.ENCRYPTION_KEY,

  shopify: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecret: process.env.SHOPIFY_API_SECRET,
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
  },

  metaAds: {
    accessToken: process.env.META_ADS_ACCESS_TOKEN,
    adAccountId: process.env.META_ADS_ACCOUNT_ID,
  },

  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    mode: process.env.PAYPAL_MODE || 'sandbox', // sandbox = مجاني بالكامل للتطوير والاختبار
  },
};
