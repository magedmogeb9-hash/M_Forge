// ============ app.js ============
// نقطة الدخول الرئيسية: التنقل بين الأقسام وربط كل الأحداث.

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Navigation ----------
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-' + item.dataset.view).classList.add('active');
      if (item.dataset.view === 'files') renderFilesExplorer();
    });
  });

  // ---------- Tabs (vision / translate) ----------
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.view');
      group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      group.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      group.querySelector('#tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  // ---------- Provider select + status ----------
  const providerSelect = document.getElementById('providerSelect');
  function refreshProviderOptions(){
    providerSelect.innerHTML = '';
    Object.entries(PROVIDERS).forEach(([id, p]) => {
      const opt = document.createElement('option');
      opt.value = id; opt.textContent = p.label;
      providerSelect.appendChild(opt);
    });
    updateApiStatus();
  }
  function updateApiStatus(){
    const dot = document.getElementById('apiStatusDot');
    const text = document.getElementById('apiStatusText');
    if (anyKeyConfigured()){
      dot.classList.add('ok');
      text.textContent = 'مزوّد جاهز للاستخدام';
    } else {
      dot.classList.remove('ok');
      text.textContent = 'اذهب للإعدادات لإضافة مفتاح API مجاني';
    }
  }
  refreshProviderOptions();

  // ---------- Depth slider ----------
  const depthSlider = document.getElementById('depthSlider');
  const depthValue = document.getElementById('depthValue');
  depthSlider.addEventListener('input', () => depthValue.textContent = depthSlider.value);

  // ---------- Reasoning chat ----------
  const chatWindow = document.getElementById('chatWindow');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');

  function addMsg(role, text){
    const div = document.createElement('div');
    div.className = 'msg ' + role;
    div.textContent = text;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return div;
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = chatInput.value.trim();
    if (!q) return;
    if (!anyKeyConfigured()){
      addMsg('system', 'الرجاء إضافة مفتاح API واحد على الأقل من قسم الإعدادات.');
      return;
    }
    addMsg('user', q);
    chatInput.value = '';
    sendBtn.disabled = true;

    const assistantDiv = document.createElement('div');
    assistantDiv.className = 'msg assistant';
    chatWindow.appendChild(assistantDiv);

    try {
      const depth = parseInt(depthSlider.value, 10);
      const providerId = providerSelect.value;
      await runDeepReasoning(q, depth, providerId, (step) => {
        if (step.status === 'running'){
          const s = document.createElement('div');
          s.className = 'think-step';
          s.innerHTML = `<span class="step-label">${step.label}...</span>`;
          assistantDiv.appendChild(s);
          chatWindow.scrollTop = chatWindow.scrollHeight;
        } else {
          const steps = assistantDiv.querySelectorAll('.think-step');
          const last = steps[steps.length - 1];
          last.innerHTML = `<span class="step-label">${step.label}</span>${step.text}`;
          chatWindow.scrollTop = chatWindow.scrollHeight;
        }
      });
    } catch (err){
      const s = document.createElement('div');
      s.className = 'think-step';
      s.textContent = '⚠ ' + err.message;
      assistantDiv.appendChild(s);
    } finally {
      sendBtn.disabled = false;
    }
  });

  // ---------- Image generation ----------
  const imageForm = document.getElementById('imageForm');
  imageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = document.getElementById('imagePrompt').value.trim();
    if (!prompt) return;
    const style = document.getElementById('imageStyle').value;
    const w = document.getElementById('imgW').value;
    const h = document.getElementById('imgH').value;
    const gallery = document.getElementById('imageGallery');

    const card = document.createElement('div');
    card.className = 'image-card';
    card.textContent = 'جارٍ التوليد...';
    gallery.prepend(card);

    try {
      const url = await generateImage(prompt, w, h, style);
      card.innerHTML = `<img src="${url}" alt="${prompt}"><a class="dl" href="${url}" download target="_blank">تحميل</a>`;
    } catch (err){
      card.textContent = '⚠ ' + err.message;
    }
  });

  // ---------- 3D scene ----------
  document.getElementById('renderSceneBtn').addEventListener('click', () => {
    const preset = document.getElementById('scenePreset').value;
    renderScene(preset);
  });

  // ---------- Code builder ----------
  document.getElementById('generateCodeBtn').addEventListener('click', async () => {
    const prompt = document.getElementById('codePrompt').value.trim();
    if (!prompt) return;
    if (!anyKeyConfigured()){ alert('أضف مفتاح API من الإعدادات أولاً.'); return; }
    const lang = document.getElementById('codeLang').value;
    const btn = document.getElementById('generateCodeBtn');
    btn.disabled = true; btn.textContent = 'جارٍ التوليد...';
    try {
      mfCodeFiles = await generateCode(prompt, lang, providerSelect.value);
      mfActiveFile = Object.keys(mfCodeFiles)[0];
      renderFileTabs(); renderEditor();
    } catch (err){
      alert('⚠ ' + err.message);
    } finally {
      btn.disabled = false; btn.textContent = 'توليد الكود';
    }
  });

  document.getElementById('downloadFileBtn').addEventListener('click', () => {
    if (!mfActiveFile) return;
    mfCodeFiles[mfActiveFile] = document.getElementById('codeEditor').textContent;
    downloadTextFile(mfActiveFile, mfCodeFiles[mfActiveFile]);
  });
  document.getElementById('downloadZipBtn').addEventListener('click', () => {
    if (mfActiveFile) mfCodeFiles[mfActiveFile] = document.getElementById('codeEditor').textContent;
    if (Object.keys(mfCodeFiles).length === 0) { alert('لا يوجد كود لتصديره بعد.'); return; }
    downloadFilesAsZip(mfCodeFiles, 'mogibforge-project.zip');
  });
  document.getElementById('saveToProjectBtn').addEventListener('click', async () => {
    if (!mfActiveFile) return;
    mfCodeFiles[mfActiveFile] = document.getElementById('codeEditor').textContent;
    for (const [name, content] of Object.entries(mfCodeFiles)){
      await fmCreateFile(name, content, mfCurrentFolder);
    }
    alert('تم الحفظ في إدارة الملفات.');
  });

  // ---------- Files ----------
  document.getElementById('newProjectBtn').addEventListener('click', async () => {
    const name = prompt('اسم المشروع:');
    if (!name) return;
    await fmCreateProject(name);
    renderFilesExplorer();
  });
  document.getElementById('newFolderBtn').addEventListener('click', async () => {
    const name = prompt('اسم المجلد:');
    if (!name) return;
    await fmCreateFolder(name, mfCurrentFolder);
    renderFilesExplorer();
  });
  document.getElementById('uploadFileBtn').addEventListener('click', () => {
    document.getElementById('uploadFileInput').click();
  });
  document.getElementById('uploadFileInput').addEventListener('change', async (e) => {
    for (const file of e.target.files){
      const text = await file.text();
      await fmCreateFile(file.name, text, mfCurrentFolder);
    }
    renderFilesExplorer();
  });
  document.getElementById('exportAllBtn').addEventListener('click', async () => {
    const all = await DB.all();
    const files = {};
    all.filter(n => n.type === 'file').forEach(n => files[n.name] = n.content || '');
    if (Object.keys(files).length === 0){ alert('لا توجد ملفات لتصديرها.'); return; }
    downloadFilesAsZip(files, 'mogibforge-all-files.zip');
  });

  // ---------- Translate ----------
  document.getElementById('translateBtn').addEventListener('click', async () => {
    const text = document.getElementById('translateInput').value.trim();
    if (!text) return;
    const from = document.getElementById('translateFrom').value;
    const to = document.getElementById('translateTo').value;
    const out = document.getElementById('translateOutput');
    out.textContent = 'جارٍ الترجمة...';
    try {
      out.textContent = await translateText(text, from, to);
    } catch (err){
      out.textContent = '⚠ ' + err.message;
    }
  });

  document.getElementById('analyzeManuscriptBtn').addEventListener('click', async () => {
    const text = document.getElementById('manuscriptInput').value.trim();
    if (!text) return;
    if (!anyKeyConfigured()){ alert('أضف مفتاح API من الإعدادات أولاً.'); return; }
    const out = document.getElementById('manuscriptOutput');
    out.innerHTML = '';
    try {
      await analyzeManuscript(text, providerSelect.value, (step) => {
        if (step.status === 'running'){
          const s = document.createElement('div');
          s.className = 'think-step';
          s.innerHTML = `<span class="step-label">${step.label}...</span>`;
          out.appendChild(s);
        } else {
          const steps = out.querySelectorAll('.think-step');
          const last = steps[steps.length - 1];
          last.innerHTML = `<span class="step-label">${step.label}</span>${step.text}`;
        }
      });
    } catch (err){
      out.textContent = '⚠ ' + err.message;
    }
  });

  // ---------- Settings ----------
  document.getElementById('key-groq').value = Keys.get('groq');
  document.getElementById('key-gemini').value = Keys.get('gemini');
  document.getElementById('key-openrouter').value = Keys.get('openrouter');

  document.getElementById('saveKeysBtn').addEventListener('click', () => {
    Keys.set('groq', document.getElementById('key-groq').value.trim());
    Keys.set('gemini', document.getElementById('key-gemini').value.trim());
    Keys.set('openrouter', document.getElementById('key-openrouter').value.trim());
    document.getElementById('saveConfirm').textContent = '✓ تم حفظ المفاتيح محلياً بنجاح.';
    updateApiStatus();
    setTimeout(() => document.getElementById('saveConfirm').textContent = '', 3000);
  });

  // ================= Auth =================
  async function refreshAuthUI(){
    const profile = await Auth.currentProfile();
    const label = document.getElementById('authUserLabel');
    const loggedOut = document.getElementById('authLoggedOut');
    const loggedIn = document.getElementById('authLoggedIn');
    const adminNav = document.querySelector('.admin-only');

    if (profile){
      label.textContent = `${profile.email} (${profile.role})`;
      if (loggedOut) loggedOut.style.display = 'none';
      if (loggedIn){
        loggedIn.style.display = 'block';
        document.getElementById('authProfileInfo').textContent = `مسجّل كـ ${profile.email} — الدور: ${profile.role} — الخطة: ${profile.plan}`;
      }
      adminNav.style.display = hasRoleAtLeast(profile.role, ROLES.ADMIN) ? 'flex' : 'none';
    } else {
      label.textContent = Auth.mode() === 'local-demo' ? 'وضع تجريبي محلي' : 'غير مسجّل الدخول';
      if (loggedOut) loggedOut.style.display = 'block';
      if (loggedIn) loggedIn.style.display = 'none';
      adminNav.style.display = 'none';
    }
  }
  refreshAuthUI();

  document.getElementById('authSignInBtn')?.addEventListener('click', async () => {
    try {
      await Auth.signIn(document.getElementById('authEmail').value, document.getElementById('authPassword').value);
      refreshAuthUI();
    } catch (err){ alert('⚠ ' + err.message); }
  });
  document.getElementById('authSignUpBtn')?.addEventListener('click', async () => {
    try {
      await Auth.signUp(document.getElementById('authEmail').value, document.getElementById('authPassword').value);
      alert('تم إنشاء الحساب. تحقق من بريدك للتأكيد إن كان مفعّلاً في Supabase، ثم سجّل الدخول.');
    } catch (err){ alert('⚠ ' + err.message); }
  });
  document.getElementById('authSignOutBtn')?.addEventListener('click', async () => {
    await Auth.signOut(); refreshAuthUI();
  });
  document.getElementById('saveSupaBtn')?.addEventListener('click', () => {
    SupaConfig.set(document.getElementById('supaUrl').value.trim(), document.getElementById('supaKey').value.trim());
    supaClient = null;
    alert('تم حفظ الاتصال. أعد تحميل الصفحة لتفعيله.');
  });
  const supaCfg = SupaConfig.get();
  if (document.getElementById('supaUrl')) document.getElementById('supaUrl').value = supaCfg.url;
  if (document.getElementById('supaKey')) document.getElementById('supaKey').value = supaCfg.key;

  document.querySelector('[data-view="admin"]')?.addEventListener('click', () => renderAdminDashboard());

  // ================= Membership / Payments =================
  let selectedPlan = null;
  const plansGrid = document.getElementById('plansGrid');
  PLANS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'plan-card';
    card.innerHTML = `<h3>${p.name}</h3><div class="price">$${p.price}${p.price > 0 ? '/شهرياً' : ''}</div>
      <ul>${p.features.map(f => `<li>✓ ${f}</li>`).join('')}</ul>`;
    card.addEventListener('click', async () => {
      plansGrid.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedPlan = p.id;
      document.getElementById('paymentPanel').style.display = 'block';
      document.getElementById('payPlanTitle').textContent = `الدفع لخطة: ${p.name}`;
      await loadPaymentUI();
    });
    plansGrid.appendChild(card);
  });

  async function loadPaymentUI(){
    const settings = await getPaymentSettings();
    const activeCoinBtn = document.querySelector('.crypto-coins .tab-btn.active');
    const coin = activeCoinBtn ? activeCoinBtn.dataset.coin : 'BTC';
    renderQR('cryptoQR', settings.crypto[coin]);
    document.getElementById('walletAddress').textContent = settings.crypto[coin] || '';

    const bankSelect = document.getElementById('bankCountrySelect');
    bankSelect.innerHTML = settings.banks.map((b, i) => `<option value="${i}">${b.country}</option>`).join('');
    function showBank(i){
      const b = settings.banks[i];
      document.getElementById('bankDetails').innerHTML = b.bankName
        ? `البنك: ${b.bankName}<br>اسم الحساب: ${b.accountName}<br>IBAN: ${b.iban}`
        : 'لم يضبط المدير حساباً بنكياً لهذه الدولة بعد.';
    }
    showBank(0);
    bankSelect.onchange = () => showBank(bankSelect.value);
  }

  document.querySelectorAll('.crypto-coins .tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.crypto-coins .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const settings = await getPaymentSettings();
      renderQR('cryptoQR', settings.crypto[btn.dataset.coin]);
      document.getElementById('walletAddress').textContent = settings.crypto[btn.dataset.coin] || '';
    });
  });
  document.querySelectorAll('.pay-methods .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pay-methods .tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.pm-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('pm-' + btn.dataset.pm).classList.add('active');
    });
  });

  document.getElementById('submitPaymentBtn')?.addEventListener('click', async () => {
    if (!selectedPlan){ alert('اختر خطة أولاً.'); return; }
    const activePm = document.querySelector('.pay-methods .tab-btn.active').dataset.pm;
    const note = document.getElementById('paymentNote').value.trim();
    try {
      await submitPaymentProof(selectedPlan, activePm, note);
      document.getElementById('paymentConfirm').textContent = '✓ تم إرسال طلبك، سيتم تفعيله بعد مراجعة الإدارة.';
    } catch (err){ alert('⚠ ' + err.message); }
  });

  // ================= Plugins =================
  const templatesWrap = document.getElementById('pluginTemplates');
  Object.entries(PLUGIN_TEMPLATES).forEach(([key, tpl]) => {
    const btn = document.createElement('button');
    btn.className = 'secondary';
    btn.textContent = tpl.label;
    btn.addEventListener('click', () => { document.getElementById('pluginCode').value = tpl.code; });
    templatesWrap.appendChild(btn);
  });

  document.querySelectorAll('.plugins-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.plugins-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.ptab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('ptab-' + btn.dataset.ptab).classList.add('active');
      if (btn.dataset.ptab === 'mine') renderMyPlugins();
      if (btn.dataset.ptab === 'store') renderStorePlugins();
    });
  });

  document.getElementById('runPluginBtn').addEventListener('click', () => {
    const code = document.getElementById('pluginCode').value;
    runPluginSandboxed(code, document.getElementById('pluginPreview'), providerSelect.value);
  });

  document.getElementById('savePluginBtn').addEventListener('click', async () => {
    const name = document.getElementById('pluginName').value.trim();
    const description = document.getElementById('pluginDesc').value.trim();
    const code = document.getElementById('pluginCode').value;
    const visibility = document.getElementById('pluginPublic').checked ? 'public' : 'private';
    if (!name || !code){ alert('أدخل اسم الإضافة والكود.'); return; }
    try {
      await savePlugin({ name, description, code, visibility });
      alert(visibility === 'public' ? 'تم الحفظ — بانتظار موافقة الإدارة للنشر العام.' : 'تم حفظ الإضافة الخاصة بك.');
    } catch (err){ alert('⚠ ' + err.message); }
  });

  async function renderMyPlugins(){
    const container = document.getElementById('myPluginsList');
    container.innerHTML = 'جارٍ التحميل...';
    try {
      const list = await listMyPlugins();
      container.innerHTML = list.length ? '' : '<p style="color:var(--text-muted)">لا توجد إضافات بعد.</p>';
      list.forEach(p => {
        const card = document.createElement('div');
        card.className = 'plugin-card';
        card.innerHTML = `<h4>${p.name}</h4><div class="meta">${p.visibility} — ${p.status}</div><p>${p.description || ''}</p>
          <button class="secondary load-plugin-btn">فتح للتعديل</button>`;
        card.querySelector('.load-plugin-btn').addEventListener('click', () => {
          document.querySelector('[data-ptab="build"]').click();
          document.getElementById('pluginName').value = p.name;
          document.getElementById('pluginDesc').value = p.description || '';
          document.getElementById('pluginCode').value = p.code;
          document.getElementById('pluginPublic').checked = p.visibility === 'public';
        });
        container.appendChild(card);
      });
    } catch (err){ container.textContent = '⚠ ' + err.message; }
  }

  async function renderStorePlugins(){
    const container = document.getElementById('storePluginsList');
    container.innerHTML = 'جارٍ التحميل...';
    try {
      const list = await listPublicApprovedPlugins();
      container.innerHTML = list.length ? '' : '<p style="color:var(--text-muted)">لا توجد إضافات عامة معتمدة بعد.</p>';
      list.forEach(p => {
        const card = document.createElement('div');
        card.className = 'plugin-card';
        card.innerHTML = `<h4>${p.name}</h4><div class="meta">بواسطة ${p.owner_email || p.owner_id}</div><p>${p.description || ''}</p>
          <button class="install-plugin-btn">تشغيل هذه الإضافة</button>`;
        card.querySelector('.install-plugin-btn').addEventListener('click', () => {
          document.querySelector('[data-ptab="build"]').click();
          document.getElementById('pluginCode').value = p.code;
          document.getElementById('pluginName').value = p.name + ' (نسخة)';
          runPluginSandboxed(p.code, document.getElementById('pluginPreview'), providerSelect.value);
        });
        container.appendChild(card);
      });
    } catch (err){ container.textContent = '⚠ ' + err.message; }
  }

});
