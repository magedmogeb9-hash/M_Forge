const { request } = require('../../../core/utils/httpClient');
const config = require('../../../core/config/env');

/**
 * PayPal REST API - بيئة Sandbox مجانية بالكامل لأي حساب مطور PayPal
 * التسجيل: https://developer.paypal.com (حساب مجاني، بدون أي تكلفة)
 * نستخدم فقط النطاقات القرائية (read-only scopes) - لا يوجد تحويل أموال هنا بتصميم مقصود
 */

function baseUrl() {
  return config.paypal.mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

function isConfigured() {
  return Boolean(config.paypal.clientId && config.paypal.clientSecret);
}

// OAuth2 client_credentials - مجاني ولا يتطلب أي موافقة مستخدم إضافية لهذا النطاق
async function getAccessToken() {
  const basic = Buffer.from(`${config.paypal.clientId}:${config.paypal.clientSecret}`).toString('base64');
  const data = await request({
    method: 'POST',
    url: `${baseUrl()}/v1/oauth2/token`,
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    data: 'grant_type=client_credentials',
  });
  return data.access_token;
}

// يجلب المعاملات الفعلية (أو معاملات Sandbox التجريبية) ضمن نطاق زمني
async function fetchTransactions({ startDate, endDate }) {
  if (!isConfigured()) return [];
  const token = await getAccessToken();
  const data = await request({
    method: 'GET',
    url: `${baseUrl()}/v1/reporting/transactions?start_date=${startDate}&end_date=${endDate}&fields=transaction_info`,
    headers: { Authorization: `Bearer ${token}` },
  });
  return (data.transaction_details || []).map((t) => ({
    externalTransactionId: t.transaction_info.transaction_id,
    type: t.transaction_info.transaction_amount.value >= 0 ? 'credit' : 'debit',
    amount: Math.abs(Number(t.transaction_info.transaction_amount.value)),
    currency: t.transaction_info.transaction_amount.currency_code,
    description: t.transaction_info.transaction_subject || '',
    status: 'completed',
    occurredAt: new Date(t.transaction_info.transaction_initiation_date),
  }));
}

// رصيد الحساب الحالي (Sandbox أو حقيقي حسب PAYPAL_MODE)
async function fetchBalance() {
  if (!isConfigured()) return 0;
  const token = await getAccessToken();
  const data = await request({
    method: 'GET',
    url: `${baseUrl()}/v1/reporting/balances`,
    headers: { Authorization: `Bearer ${token}` },
  });
  const primary = data.balances?.[0];
  return primary ? Number(primary.total_balance.value) : 0;
}

module.exports = { isConfigured, fetchTransactions, fetchBalance };
