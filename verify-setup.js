require('dotenv').config();

/**
 * سكريبت فحص الجاهزية - يشغَّل بـ: node scripts/verify-setup.js
 * يتحقق من اكتمال إعدادات كل وحدة قبل الرفع/التشغيل، دون الحاجة لاتصال قاعدة بيانات فعلي
 */

const checks = [];

function check(moduleName, condition, hint) {
  checks.push({ moduleName, ok: Boolean(condition), hint });
}

// ==== أساسيات النواة (إلزامية) ====
check('Core / JWT_SECRET', process.env.JWT_SECRET && process.env.JWT_SECRET !== 'CHANGE_ME_LONG_RANDOM_STRING', 'مطلوب - غيّر القيمة الافتراضية في .env');
check('Core / ENCRYPTION_KEY', process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length >= 32, 'مطلوب لتشفير التوكنات - 32 حرف على الأقل');
check('Core / MONGO_URI_CORE', Boolean(process.env.MONGO_URI_CORE), 'مطلوب لتشغيل النواة');

// ==== E-commerce ====
check('Ecommerce / MongoDB', Boolean(process.env.MONGO_URI_ECOMMERCE), 'مطلوب');
check(
  'Ecommerce / Shopify (اختياري)',
  Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_API_KEY),
  'اختياري - بدونه تعمل الوحدة محلياً فقط بدون مزامنة Shopify'
);

// ==== Social ====
check('Social / MongoDB', Boolean(process.env.MONGO_URI_SOCIAL), 'مطلوب');
check(
  'Social / Meta Graph API (اختياري لكن مجاني)',
  Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),
  'سجّل تطبيق مجاني على developers.facebook.com لتفعيل النشر الفعلي على فيسبوك/إنستغرام'
);

// ==== Ads & Trends ====
check('Ads / MongoDB', Boolean(process.env.MONGO_URI_ADS), 'مطلوب');
check(
  'Ads / Meta Marketing API (اختياري)',
  Boolean(process.env.META_ADS_ACCESS_TOKEN && process.env.META_ADS_ACCOUNT_ID),
  'اختياري - بدونه الحملات تُنشأ محلياً فقط بدون ربط فعلي'
);
check('Trends / Google Trends', true, 'مجاني تلقائياً - لا يحتاج مفتاح API إطلاقاً (google-trends-api)');

// ==== Banking ====
check('Banking / MongoDB', Boolean(process.env.MONGO_URI_BANKING), 'مطلوب - يجب أن تكون معزولة تماماً');
check(
  'Banking / PayPal Sandbox (مجاني)',
  Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
  'أنشئ حساب مطور مجاني على developer.paypal.com واحصل على Sandbox Client ID/Secret'
);

// ==== AI Trainer ====
check('AI Trainer', true, 'داخلي بالكامل - لا يحتاج أي إعداد خارجي');

// ==== الطباعة ====
console.log('\n📋 نتيجة فحص الجاهزية للمنصة\n' + '='.repeat(50));
let requiredMissing = 0;
for (const c of checks) {
  const icon = c.ok ? '✅' : '⚠️ ';
  console.log(`${icon} ${c.moduleName}${c.ok ? '' : ` — ${c.hint}`}`);
  if (!c.ok && !c.hint.startsWith('اختياري')) requiredMissing++;
}
console.log('='.repeat(50));
console.log(
  requiredMissing === 0
    ? '✅ كل الإعدادات الإلزامية جاهزة. الوحدات الاختيارية تعمل تلقائياً بدون تكامل خارجي إذا لم تُهيَّأ.\n'
    : `⚠️ يوجد ${requiredMissing} إعداد إلزامي ناقص - راجع القائمة أعلاه قبل التشغيل.\n`
);

process.exit(requiredMissing === 0 ? 0 : 1);
