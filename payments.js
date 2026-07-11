// ============ payments.js ============
// نظام اشتراكات واقعي: عرض عملات رقمية (QR) + تعليمات بنكية محلية قابلة للتخصيص،
// مع تأكيد يدوي من الإدارة (النهج الصحيح قبل ربط بوابة دفع مرخّصة مثل Paymob/Moyasar/Stripe).

const PLANS = [
  { id: 'free', name: 'مجاني', price: 0, features: ['محرك التفكير (طبقة واحدة)', 'توليد صور محدود', '3 مشاريع أكواد'] },
  { id: 'pro', name: 'احترافي', price: 9, features: ['كل طبقات التفكير العميق (5)', 'توليد صور غير محدود', 'مشاريع غير محدودة', 'نشر إضافات عامة'] },
  { id: 'premium', name: 'بريميوم', price: 29, features: ['كل مزايا الاحترافي', 'دعم أولوية', 'وصول مبكر للمزايا الجديدة'] }
];

const DEFAULT_PAYMENT_SETTINGS = {
  crypto: {
    BTC: '',
    ETH: '',
    USDT_TRC20: ''
  },
  banks: [
    { country: 'السعودية', bankName: '', accountName: '', iban: '' },
    { country: 'مصر', bankName: '', accountName: '', iban: '' },
    { country: 'الإمارات', bankName: '', accountName: '', iban: '' }
  ]
};

async function getPaymentSettings(){
  if (Auth.mode() === 'local-demo'){
    const raw = localStorage.getItem('mf_payment_settings');
    return raw ? JSON.parse(raw) : DEFAULT_PAYMENT_SETTINGS;
  }
  const supa = getSupa();
  const { data, error } = await supa.from('payment_settings').select('*').eq('id', 1).single();
  if (error || !data) return DEFAULT_PAYMENT_SETTINGS;
  return { crypto: data.crypto || DEFAULT_PAYMENT_SETTINGS.crypto, banks: data.banks || DEFAULT_PAYMENT_SETTINGS.banks };
}

async function savePaymentSettings(settings){
  if (Auth.mode() === 'local-demo'){
    localStorage.setItem('mf_payment_settings', JSON.stringify(settings));
    return;
  }
  const supa = getSupa();
  const { error } = await supa.from('payment_settings').upsert({ id: 1, ...settings });
  if (error) throw error;
}

function renderQR(elementId, text){
  const el = document.getElementById(elementId);
  el.innerHTML = '';
  if (!text) { el.textContent = 'لم يضبط المدير عنوان محفظة لهذه العملة بعد.'; return; }
  new QRCode(el, { text, width: 120, height: 120, colorDark: '#0B0A08', colorLight: '#F0D264' });
}

async function submitPaymentProof(plan, method, note){
  const profile = await Auth.currentProfile();
  if (!profile) throw new Error('يجب تسجيل الدخول أولاً.');

  if (Auth.mode() === 'local-demo'){
    const list = JSON.parse(localStorage.getItem('mf_subscriptions') || '[]');
    list.push({ id: 'sub_' + Date.now(), user_id: profile.id, email: profile.email, plan, method, note, status: 'pending', created_at: Date.now() });
    localStorage.setItem('mf_subscriptions', JSON.stringify(list));
    return;
  }
  const supa = getSupa();
  const { error } = await supa.from('subscriptions').insert({ user_id: profile.id, plan, payment_method: method, note, status: 'pending' });
  if (error) throw error;
}

async function listSubscriptionRequests(){
  if (Auth.mode() === 'local-demo') return JSON.parse(localStorage.getItem('mf_subscriptions') || '[]');
  const supa = getSupa();
  const { data, error } = await supa.from('subscriptions').select('*, profiles(email)').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function approveSubscription(subId, userId, plan){
  if (Auth.mode() === 'local-demo'){
    const list = JSON.parse(localStorage.getItem('mf_subscriptions') || '[]');
    const item = list.find(s => s.id === subId);
    if (item) item.status = 'approved';
    localStorage.setItem('mf_subscriptions', JSON.stringify(list));
    return;
  }
  const supa = getSupa();
  await supa.from('subscriptions').update({ status: 'approved' }).eq('id', subId);
  await supa.from('profiles').update({ plan }).eq('id', userId);
}
