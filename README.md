# MogibForge 🦅

منصّة ذكاء اصطناعي مفتوحة المصدر بالكامل — ملف واحد فقط (`index.html`)، لا يحتاج أي بناء (build) ولا أي مجلدات إضافية. تصميم ذهبي/أسود فاخر، دعم كامل للعربية (RTL)، متجاوب مع الجوال.

## ⚠️ لماذا ملف واحد فقط؟ (سبب تعطّل النسخة السابقة)
النسخة الأولى كانت مقسّمة على عدة ملفات (`css/style.css`, `js/*.js`). عند الرفع اليدوي على GitHub عبر السحب والإفلات، فقدت المجلدات الفرعية بنيتها أثناء الرفع، فحمّل المتصفح `index.html` فقط بدون التنسيق والوظائف — لهذا ظهر الموقع كصفحة نصية عادية بدون تصميم.
**الحل: كل شيء الآن مدموج داخل ملف `index.html` واحد (CSS + JS بالكامل بالداخل)** — يستحيل أن يفقد جزءاً منه عند الرفع، بغض النظر عن طريقة الرفع.

## ✨ كل المزايا

| القسم | الوصف |
|---|---|
| 🧠 التفكير العميق | 5 طبقات تكرار حقيقية: تحليل مباشر ← نقد عكسي (Adversarial) ← فرضيات بديلة ← توليف ← تنقيح. |
| 🌐 شبكة الـ APIs (الوضع الجماعي) | استدعاء حتى **20 واجهة API** متوافقة مع صيغة OpenAI بالتوازي (Groq, Gemini, OpenRouter مدمجة + حتى 17 واجهة مخصّصة: Together, Fireworks, DeepInfra, Cerebras, Mistral...)، ثم تحليل كل الإجابات وتوليد إجابة نهائية واحدة أدق (تقنية Mixture-of-Agents / Self-consistency الحقيقية). |
| 🎨 توليد الصور | مجاني بالكامل بدون مفتاح عبر Pollinations.ai. |
| 🌀 تصوّر 3D متحرك | مشاهد Three.js تفاعلية — بديل واقعي وشغّال لمفهوم "الفيديو 4D" غير الموجود فعلياً. |
| 💻 بناء الأكواد | توليد مشاريع كاملة، تحرير مباشر، تحميل ملف أو ZIP. |
| 🗂️ إدارة الملفات | مشاريع/مجلدات محفوظة محلياً (IndexedDB). |
| 🌐 الترجمة والمخطوطات | ترجمة فورية + تحليل نصوص غامضة عبر محرك التفكير العميق. |
| 👑 لوحة تحكم المدير | إدارة الأعضاء والأدوار (owner/admin/moderator/member)، طلبات الاشتراك، إعدادات الدفع، مراجعة الإضافات. |
| 💳 العضوية والاشتراك | 3 خطط، دفع بعملات رقمية (QR) أو تحويل بنكي محلي حسب الدولة، بتأكيد يدوي من الإدارة. |
| 🧩 تطوير التطبيق من داخله | أي عضو يكتب "إضافة" (قوالب جاهزة للمبتدئين أو كود حر) تُنفَّذ بأمان داخل `iframe sandbox` معزول، يستخدمها في عمله أو ينشرها للجميع بعد موافقة الإدارة. |
| 🎯 التنبؤ الجماعي | أعضاء يتوقعون نتائج أسئلة مستقبلية بنقاط داخلية (بدون أموال حقيقية)، مع "رأي النماذج" كمرجع، وتوزيع أرباح Pari-mutuel، ولوحة متصدرين. |

## 🚀 الرفع على GitHub (3 دقائق)

1. أنشئ مستودعاً جديداً على [github.com](https://github.com/new) — اجعله Public.
2. ارفع **3 ملفات فقط**: `index.html`، `README.md`، `LICENSE` (اسحبها للمستودع مباشرة، بدون مجلدات).
3. **Settings → Pages** → اختر الفرع `main` والمجلد `/ (root)` → Save.
4. افتح `https://USERNAME.github.io/REPO-NAME/` بعد دقيقة.

## 🔑 ربط مزوّدي الذكاء الاصطناعي (من داخل التطبيق)

- **الإعدادات ومفاتيح API**: أضف مفتاح [Groq](https://console.groq.com) (الأسرع) و/أو [Gemini](https://aistudio.google.com/apikey) و/أو [OpenRouter](https://openrouter.ai/keys) (نماذج `:free` متعددة بمفتاح واحد).
- **شبكة الـ APIs**: أضف أي واجهة إضافية متوافقة مع OpenAI (حتى 20 إجمالاً) لتشغيل "الوضع الجماعي" في محرك التفكير.
- كل المفاتيح تُحفظ محلياً في متصفحك فقط (`localStorage`) — لا تمر عبر أي خادم وسيط.

## 🗄️ تفعيل الأعضاء/الصلاحيات/الاشتراكات الحقيقية (Supabase — مجاني)

بدون هذه الخطوة، يعمل التطبيق بـ **"وضع تجريبي محلي"** (أنت فقط، بدور owner، محفوظ بجهازك). لتفعيل أعضاء حقيقيين متزامنين:

1. أنشئ مشروعاً مجانياً على [supabase.com](https://supabase.com).
2. من **Project Settings → API**: انسخ `Project URL` و `anon public key`.
3. من **SQL Editor**، نفّذ:

```sql
create table profiles (
  id uuid references auth.users primary key,
  email text, role text default 'member', plan text default 'free',
  permissions jsonb default '{}', created_at timestamptz default now()
);
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id), plan text, payment_method text,
  note text, status text default 'pending', created_at timestamptz default now()
);
create table payment_settings (
  id int primary key default 1, crypto jsonb default '{}', banks jsonb default '[]'
);
insert into payment_settings (id) values (1);
create table plugins (
  id text primary key, owner_id uuid references profiles(id), owner_email text,
  name text, description text, code text, visibility text default 'private',
  status text default 'approved', created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table payment_settings enable row level security;
alter table plugins enable row level security;

create policy "read all profiles" on profiles for select using (true);
create policy "update own profile" on profiles for update using (auth.uid() = id);
create policy "admin update any profile" on profiles for update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','admin')));

create policy "insert own subscription" on subscriptions for insert with check (auth.uid() = user_id);
create policy "read own or admin subscriptions" on subscriptions for select using (
  auth.uid() = user_id or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','admin')));
create policy "admin update subscriptions" on subscriptions for update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','admin')));

create policy "read payment settings" on payment_settings for select using (true);
create policy "admin write payment settings" on payment_settings for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','admin')));

create policy "read own or public approved plugins" on plugins for select using (
  owner_id = auth.uid() or (visibility = 'public' and status = 'approved')
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','admin')));
create policy "insert own plugin" on plugins for insert with check (owner_id = auth.uid());
create policy "update own or admin plugin" on plugins for update using (
  owner_id = auth.uid() or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','admin')));

-- التنبؤ الجماعي (نقاط داخلية فقط — ليست أموالاً حقيقية، انظر قسم "لماذا نقاط لا أموال" أدناه)
alter table profiles add column if not exists points int default 1000;

create table prediction_questions (
  id text primary key, question text, category text, options jsonb,
  ai_opinion jsonb, status text default 'open', correct_option text,
  created_by uuid references profiles(id), created_at timestamptz default now()
);
create table prediction_stakes (
  id text primary key, question_id text references prediction_questions(id),
  user_id uuid references profiles(id), email text, option text, points int,
  created_at timestamptz default now()
);

alter table prediction_questions enable row level security;
alter table prediction_stakes enable row level security;

create policy "read all questions" on prediction_questions for select using (true);
create policy "admin manage questions" on prediction_questions for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','admin')));

create policy "read all stakes" on prediction_stakes for select using (true);
create policy "insert own stake" on prediction_stakes for insert with check (user_id = auth.uid());
```

4. من التطبيق: **الإعدادات → قاعدة البيانات الحقيقية**، الصق الـ URL والمفتاح، احفظ، أعد تحميل الصفحة، وسجّل حساباً.
5. اجعل أول حساب `owner` يدوياً (مرة واحدة فقط):
```sql
update profiles set role = 'owner' where email = 'بريدك@example.com';
```

## 🎯 عن ميزة "التنبؤ الجماعي"
هذه الميزة تعمل بنظام **نقاط داخلية غير قابلة للصرف نقداً** — وليست مقامرة بأموال حقيقية، لأن ذلك يتطلب ترخيصاً رسمياً في كل دولة ومحظور قانونياً/شرعياً في معظم الدول العربية. توزيع الأرباح يتم بنظام Pari-mutuel (رهانات الخاسرين تُقسَّم على الفائزين نسبةً لحصة كل واحد). كل عضو جديد يبدأ برصيد 1000 نقطة ترحيبية. يمكن للمدير لاحقاً ربط النقاط بخصومات حقيقية على الاشتراك بدلاً من صرفها نقداً.

## 💰 عن الدفع الحقيقي
النظام يعرض عناوين محافظ رقمية وتعليمات تحويل بنكي ويسجّل "طلب دفع" فقط — التفعيل يدوي من المدير بعد التحقق. للأتمتة الكاملة، اربط لاحقاً بوابة مرخّصة: **Paymob/Fawry** (مصر)، **Moyasar/HyperPay** (الخليج)، **Stripe/PayPal** (دولياً)، أو **BTCPay Server** ذاتي الاستضافة للعملات الرقمية.

## 🧩 عن أمان الإضافات
كل كود يكتبه الأعضاء يُنفَّذ داخل `<iframe sandbox="allow-scripts">` بدون `allow-same-origin` — لا وصول مباشر لمفاتيح API أو بيانات أعضاء آخرين. أي قدرة (مثل استدعاء الذكاء الاصطناعي) تمر عبر جسر `postMessage` محدود. النشر العام يتطلب موافقة المدير.

## 📜 الترخيص
مفتوح المصدر بالكامل (MIT) — استخدمه وعدّله ووزّعه بحرية.
