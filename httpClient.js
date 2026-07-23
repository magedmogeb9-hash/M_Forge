const axios = require('axios');

// عميل HTTP موحّد لكل استدعاءات الـ APIs الخارجية المجانية عبر المنصة
// - مهلة زمنية موحدة تمنع تعليق الخادم لو API خارجي تأخر
// - تحويل أخطاء axios لرسائل عربية مفهومة بدل تسريب تفاصيل تقنية خام
const client = axios.create({ timeout: 10000 });

async function request(config) {
  try {
    const res = await client.request(config);
    return res.data;
  } catch (err) {
    const status = err.response?.status || 502;
    const providerMessage = err.response?.data?.error?.message || err.response?.data?.message || err.message;
    const wrapped = new Error(`فشل الاتصال بخدمة خارجية: ${providerMessage}`);
    wrapped.status = status;
    wrapped.providerRaw = err.response?.data;
    throw wrapped;
  }
}

module.exports = { request };
