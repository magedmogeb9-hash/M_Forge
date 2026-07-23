# AI Assistant Platform

منصة مساعد ذكاء اصطناعي متكاملة، مبنية كوحدات مستقلة (modular architecture) تتواصل عبر نواة مركزية (Core). كل وحدة مربوطة بـ **API مجاني حقيقي**، وليست مجرد بيانات وهمية (mock).

## البنية النهائية

```
ai-assistant-platform/
├── core/                          # النواة المركزية
│   ├── server.js                  # نقطة الدخول - يربط كل الوحدات الخمس
│   ├── config/
│   │   ├── env.js                 # كل متغيرات البيئة من مكان واحد
│   │   └── database.js            # اتصالات قواعد بيانات منفصلة تماماً لكل وحدة
│   ├── middleware/
│   │   ├── auth.js                # JWT + صلاحيات (roles)
│   │   └── errorHandler.js        # معالج أخطاء موحد
│   └── utils/
│       ├── encryption.js          # تشفير AES-256-GCM (سوشيال ميديا + بنوك)
│       └── httpClient.js          # عميل HTTP موحد لكل الـ APIs الخارجية
│
├── modules/
│   ├── ecommerce/                 # 1️⃣ المتجر الإلكتروني  → Shopify Admin API
│   ├── social/                    # 2️⃣ السوشيال ميديا     → Meta Graph API
│   ├── ads/                       # 3️⃣ الإعلانات والترندات → Meta Marketing API + Google Trends
│   ├── banking/                   # 4️⃣ الحسابات البنكية    → PayPal Sandbox API
│   └── ai-trainer/                # 5️⃣ تطوير المساعد بالكود → Hugging Face Inference API
│       كل وحدة: models/ → services/ (+ adapter API خارجي) → controllers/ → routes/
│
├── scripts/
│   └── verify-setup.js            # فحص جاهزية كل وحدة قبل التشغيل (npm run verify)
│
├── .github/
│   └── workflows/
│       └── ci.yml                 # فحص تلقائي (syntax + verify) عند كل push/PR
│
├── .env.example                   # نموذج متغيرات البيئة (بدون أسرار حقيقية)
├── .gitignore
├── LICENSE                        # MIT
├── package.json
└── README.md
```

## الوحدات الخمس والـ API المجاني المرتبط بكل واحدة

| # | الوحدة | API مجاني مستخدم | الحالة |
|---|--------|-------------------|--------|
| 1 | **E-commerce** | Shopify Admin API (مجاني حتى مع متجر تطوير مجاني) | مزامنة اختيارية عند الإنشاء + جلب مباشر `/shopify/live` |
| 2 | **Social Media** | Meta Graph API (فيسبوك/إنستغرام - مجاني بالكامل) | نشر فعلي على صفحات فيسبوك وحسابات إنستغرام بزنس |
| 3 | **Ads & Trends** | Meta Marketing API + Google Trends (`google-trends-api` - بدون مفتاح إطلاقاً) | إنشاء حملات (تبدأ PAUSED كإجراء أمان) + جلب ترندات حقيقية `/trends/live` |
| 4 | **Digital Banking** | PayPal Sandbox REST API (حساب مطور مجاني 100%) | **قراءة فقط** (رصيد + معاملات) - لا تحويل أموال بتصميم مقصود |
| 5 | **AI Trainer** | Hugging Face Inference API (حساب شخصي مجاني) | اقتراح كود لمهارة جديدة عبر `/skills/suggest`، ثم اختبار وتفعيل يدوي |

> جميع التكاملات **اختيارية**: إذا لم تُضف مفاتيح API في `.env`، كل وحدة تستمر بالعمل محلياً (قاعدة بيانات داخلية فقط) دون كسر أي شيء.

## التشغيل محلياً

```bash
npm install
cp .env.example .env      # عدّل القيم الحقيقية (كلها اختيارية عدا JWT_SECRET وENCRYPTION_KEY وروابط Mongo)
npm run verify             # يفحص جاهزية كل وحدة قبل التشغيل ويطبع تقريراً واضحاً
npm run dev
```

## وحدة تطوير المساعد الذكي (AI Trainer) - تفصيل خاص

هذه أهم وأحساس وحدة تقنياً لأنها تنفذ كوداً من داخل التطبيق:

1. **الاقتراح** (`POST /api/ai-trainer/skills/suggest`): يرسل وصف نصي لـ Hugging Face (مجاني) ويرجع كود JS مقترح - **لا يُحفظ ولا يُنفَّذ تلقائياً**
2. **الإنشاء** (`POST /api/ai-trainer/skills`): يحفظ الكود كـ "مهارة" بحالة `enabled: false`
3. **الاختبار** (`POST /api/ai-trainer/skills/:id/test`): ينفذ الكود داخل بيئة معزولة (`vm` المدمجة في Node.js) بمهلة زمنية 2 ثانية، ويسجل النتيجة
4. **التفعيل** (`PATCH /api/ai-trainer/skills/:id/enable`): **يُرفض تلقائياً** إذا لم ينجح الاختبار في الخطوة السابقة

⚠️ **تحذير أمني موثّق في الكود** (`sandboxService.js`): وحدة `vm` المدمجة تعزل النطاق فقط وليست حاجز أمان حقيقي. للإنتاج الفعلي، استبدلها بحاوية Docker منفصلة أو مكتبة `isolated-vm`. كل مسارات هذه الوحدة مقصورة على دور `owner` فقط مع حد صارم 20 تنفيذ/دقيقة.

## ⚠️ ملاحظات أمان حرجة قبل الرفع/النشر

- **لا يوجد اتصال إنترنت متاح في بيئة المراجعة الحالية** - تم فحص كل الملفات نحوياً (`node --check`) والتحقق من كل مسارات `require` المحلية برمجياً، لكن `npm install` الفعلي واختبار التشغيل الحي (مع MongoDB حقيقي) يجب أن يتما على جهازك أو في CI/CD على GitHub
- تأكد أن `.env` غير موجود في أي commit (موجود في `.gitignore`)، ولا ترفع أي مفتاح API حقيقي حتى في الأمثلة
- **وحدة البنوك**: مصممة كـ read-only فقط. أي تحويل أموال فعلي يجب أن يمر عبر واجهة PayPal/Payoneer الرسمية مباشرة، وليس عبر هذا الكود
- **وحدة AI Trainer**: قيّد الوصول لها بدور `owner` فقط (موجود بالفعل)، وفعّل مراجعة بشرية لأي كود قبل التفعيل

## الخطوات التالية المقترحة بعد الرفع على GitHub

1. ✅ ~~أضف GitHub Actions workflow~~ — موجود بالفعل (`.github/workflows/ci.yml`) ويعمل تلقائياً عند كل push
2. اربط MongoDB Atlas (طبقة مجانية M0) بدل MongoDB محلي للتشغيل الفعلي
3. فعّل تدريجياً كل API حسب الحاجة (تبدأ المنصة تعمل كاملة محلياً بدونها جميعاً)
