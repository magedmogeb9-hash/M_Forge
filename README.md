# MogibForge 🦅

منصّة ذكاء اصطناعي مفتوحة المصدر بالكامل، تعمل من متصفحك مباشرة بدون خادم خلفي — تصميم ذهبي/أسود فاخر، دعم كامل للعربية (RTL).

## ✨ المزايا

| القسم | الوصف |
|---|---|
| 🧠 التفكير العميق | محرك تحليل متعدد الطبقات: تحليل مباشر ← نقد عكسي (Adversarial) ← فرضيات بديلة ← توليف نهائي ← تنقيح. عدد الطبقات قابل للتحكم (1-5). |
| 🎨 توليد الصور | مجاني بالكامل بدون مفتاح عبر [Pollinations.ai](https://pollinations.ai). |
| 🌀 تصوّر 3D متحرك | مشاهد ثلاثية الأبعاد تفاعلية (صقر ذهبي، مدارات، بلورة، موجات طاقة) عبر Three.js — بديل واقعي لمفهوم "الفيديو 4D". |
| 💻 بناء الأكواد | توليد مشاريع كاملة (HTML/CSS/JS، Python، React...)، تحرير مباشر، تحميل ملف واحد أو المشروع كاملاً كـ ZIP. |
| 🗂️ إدارة الملفات | مشاريع/مجلدات/ملفات محفوظة محلياً في IndexedDB داخل متصفحك. |
| 🌐 الترجمة | ترجمة نصوص فورية (عربي/إنجليزي/فرنسي)، بالإضافة إلى تحليل نصوص/مخطوطات غامضة عبر محرك التفكير العميق. |

## ⚠️ ملاحظة صادقة عن الحدود

- لا توجد حالياً أي خدمة **فيديو 4D** مجانية حقيقية. البديل المطبَّق هنا هو تصوّرات 3D متحركة (حركة + زمن)، وهو الأقرب عملياً وتقنياً.
- "التفكير الاحتمالي الضخم" مطبَّق هنا كتقنية حقيقية: تكرار وتحقق ذاتي متعدد الطبقات (Self-consistency + Adversarial critique)، وليس كضرب حرفي بعدد احتمالات.

## 🔑 مزوّدو الذكاء الاصطناعي المجانيون المدعومون

1. **Groq** (موصى به — سريع جداً ومجاني): [console.groq.com](https://console.groq.com)
2. **Google Gemini 2.0 Flash** (حد مجاني سخي): [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
3. **OpenRouter** (نماذج متعددة بعلامة `:free`): [openrouter.ai/keys](https://openrouter.ai/keys)

كل المفاتيح تُحفظ محلياً في متصفحك فقط (`localStorage`) — لا يمر أي مفتاح أو طلب عبر أي خادم خارجي غير مزوّد النموذج نفسه.

## 🚀 التشغيل

### محلياً
```bash
git clone <رابط-المستودع>
cd MogibForge
# افتح index.html مباشرة في المتصفح، أو:
python3 -m http.server 8000
# ثم افتح http://localhost:8000
```

### عبر GitHub Pages
1. ارفع المجلد لمستودع GitHub جديد.
2. من إعدادات المستودع → Pages → اختر الفرع `main` والمجلد الجذري.
3. التطبيق سيكون متاحاً على `https://<username>.github.io/<repo>`.

## 🛠️ البنية التقنية

```
MogibForge/
├── index.html
├── css/style.css
├── js/
│   ├── storage.js      # localStorage + IndexedDB
│   ├── providers.js     # Groq / Gemini / OpenRouter
│   ├── reasoning.js      # محرك التفكير العميق
│   ├── imagegen.js       # Pollinations.ai
│   ├── scene3d.js        # Three.js scenes
│   ├── codebuilder.js    # توليد وتحرير الأكواد
│   ├── filemanager.js    # إدارة المشاريع
│   ├── translator.js     # الترجمة والمخطوطات
│   ├── zipper.js         # تصدير ZIP (JSZip)
│   └── app.js            # الربط الرئيسي
└── README.md
```

بدون أي إطار عمل (framework) — HTML/CSS/JS خام بالكامل، لتشغيل فوري بدون بناء (build step).

---

## 🆕 الإصدار 2: الأعضاء، الصلاحيات، الاشتراكات، والإضافات

### ما الجديد
| القسم | الوصف |
|---|---|
| 👑 لوحة تحكم المدير | إدارة الأعضاء (تغيير الدور: owner/admin/moderator/member)، الخطط، طلبات الاشتراك، إعدادات الدفع، مراجعة الإضافات العامة. |
| 🔐 الأدوار والصلاحيات | 4 مستويات: `owner` > `admin` > `moderator` > `member`، مع صلاحيات إضافية قابلة للتوسعة عبر حقل `permissions` (JSON). |
| 💳 العضوية والدفع | 3 خطط (مجاني/احترافي/بريميوم)، دفع بعملات رقمية (BTC/ETH/USDT) عبر QR، أو تحويل بنكي محلي حسب الدولة — بتأكيد يدوي من الإدارة. |
| 🧩 الإضافات (Plugins) | أي عضو يكتب كوداً (قوالب جاهزة للمبتدئين أو كود حر) يُنفَّذ داخل بيئة معزولة (`iframe sandbox`)، يحفظه خاصاً لاستخدامه في أعماله، أو ينشره عاماً بعد موافقة الإدارة ليستخدمه بقية الأعضاء. |

### ⚠️ الحد الحقيقي المهم جداً
بدون ضبط **Supabase**، يعمل التطبيق بـ **"وضع تجريبي محلي"**: عضو واحد فقط (أنت) بدور `owner` مخزّن في متصفحك فقط. لا يمكن لأي نظام صلاحيات/اشتراكات حقيقي أن يعمل بدون قاعدة بيانات مركزية — وهذا ينطبق على أي تطبيق ويب في العالم، وليس قصوراً في هذا الكود تحديداً.

### 🛠️ خطوات تفعيل الوضع الحقيقي (Supabase — مجاني بالكامل)

1. أنشئ مشروعاً على [supabase.com](https://supabase.com) (مجاني، بدون بطاقة ائتمان).
2. من **Project Settings → API**، انسخ `Project URL` و `anon public key`.
3. من **SQL Editor**، شغّل هذا الاستعلام لإنشاء الجداول:

```sql
-- الملفات الشخصية والأدوار
create table profiles (
  id uuid references auth.users primary key,
  email text,
  role text default 'member',
  plan text default 'free',
  permissions jsonb default '{}',
  created_at timestamptz default now()
);

-- طلبات الاشتراك
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  plan text,
  payment_method text,
  note text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- إعدادات الدفع (عملات رقمية وبنوك محلية)
create table payment_settings (
  id int primary key default 1,
  crypto jsonb default '{}',
  banks jsonb default '[]'
);
insert into payment_settings (id) values (1);

-- الإضافات (Plugins)
create table plugins (
  id text primary key,
  owner_id uuid references profiles(id),
  owner_email text,
  name text,
  description text,
  code text,
  visibility text default 'private',
  status text default 'approved',
  created_at timestamptz default now()
);

-- سياسات الوصول (RLS) — أساسية، عدّلها حسب احتياجك الأمني
alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table payment_settings enable row level security;
alter table plugins enable row level security;

create policy "read own or admin" on profiles for select using (true);
create policy "update own profile" on profiles for update using (auth.uid() = id);
create policy "admin update any profile" on profiles for update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','admin'))
);

create policy "insert own subscription" on subscriptions for insert with check (auth.uid() = user_id);
create policy "read own or admin subscriptions" on subscriptions for select using (
  auth.uid() = user_id or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','admin'))
);
create policy "admin update subscriptions" on subscriptions for update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','admin'))
);

create policy "read payment settings" on payment_settings for select using (true);
create policy "admin write payment settings" on payment_settings for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','admin'))
);

create policy "read own or public approved plugins" on plugins for select using (
  owner_id = auth.uid() or (visibility = 'public' and status = 'approved')
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','admin'))
);
create policy "insert own plugin" on plugins for insert with check (owner_id = auth.uid());
create policy "update own or admin plugin" on plugins for update using (
  owner_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','admin'))
);
```

4. **أول مستخدم يسجّل يجب أن يصبح `owner` يدوياً** (نفّذ مرة واحدة فقط بعد أول تسجيل):
```sql
update profiles set role = 'owner' where email = 'بريدك@example.com';
```

5. من التطبيق: **الإعدادات → قاعدة البيانات الحقيقية**، الصق الـ URL والمفتاح، احفظ، ثم أعد تحميل الصفحة وسجّل حساباً.

### 💰 عن معالجة الدفع الحقيقية
هذا النظام **يعرض** عناوين المحافظ وتعليمات التحويل ويسجّل "طلب دفع" فقط — التفعيل يتم يدوياً من المدير بعد التحقق. لأتمتة كاملة (تحقق تلقائي من استلام العملة الرقمية، أو خصم تلقائي من البطاقات/البنوك)، الخطوة التالية هي ربط بوابة دفع مرخّصة حسب دولتك المستهدفة، مثل: **Paymob** أو **Fawry** (مصر)، **Moyasar** أو **HyperPay** (السعودية والخليج)، **Stripe/PayPal** (دولياً)، أو عقد تحقق مباشر مع مزود Blockchain (BTCPay Server ذاتي الاستضافة) للعملات الرقمية.

### 🧩 عن أمان نظام الإضافات
كل كود يكتبه الأعضاء يُنفَّذ داخل `<iframe sandbox="allow-scripts">` بدون `allow-same-origin`، بمعنى: **لا يمكن للإضافة الوصول لمفاتيح API الخاصة بك، أو لبيانات أعضاء آخرين، أو للصفحة الأصلية مباشرة** — أي قدرة (مثل استدعاء الذكاء الاصطناعي) تمر عبر جسر `postMessage` محدود ومُراقَب. الإضافات المعلنة للنشر العام تحتاج **موافقة يدوية من المدير** قبل ظهورها للجميع، تماماً كمراجعة إضافات المتصفح أو تطبيقات المتجر.

---

## 📜 الترخيص

مفتوح المصدر بالكامل — استخدمه، عدّله، وزّعه بحرية (MIT).
