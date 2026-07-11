// ============ plugins.js ============
// ميزة تطوير التطبيق من داخله: الأعضاء يكتبون كوداً (قوالب بسيطة أو كود حر)
// يُنفَّذ داخل iframe معزول (sandbox) بدون وصول مباشر لمفاتيح API أو بيانات
// أعضاء آخرين — أي قدرة حساسة تمر عبر جسر postMessage محدود وواضح.

const PLUGIN_TEMPLATES = {
  button: {
    label: 'زر يقوم بإجراء بسيط',
    code:
`// قالب: زر ينفذ إجراء عند الضغط
document.body.innerHTML = '<button id="btn" style="padding:10px 18px;font-family:sans-serif">اضغط هنا</button><p id="out"></p>';
document.getElementById('btn').onclick = () => {
  document.getElementById('out').textContent = 'تم الضغط! يمكنك وضع أي منطق هنا.';
};`
  },
  tool: {
    label: 'أداة تحويل نص بسيطة',
    code:
`// قالب: أداة تحويل نص (مثال: عكس النص)
document.body.innerHTML = \`
  <textarea id="inp" style="width:100%;height:80px;font-family:sans-serif" placeholder="اكتب نصاً..."></textarea>
  <button id="go" style="margin-top:8px;padding:8px 16px">حوّل</button>
  <p id="res" style="font-family:sans-serif"></p>
\`;
document.getElementById('go').onclick = () => {
  const v = document.getElementById('inp').value;
  document.getElementById('res').textContent = v.split('').reverse().join('');
};`
  },
  aiTool: {
    label: 'أداة تستخدم الذكاء الاصطناعي (عبر الجسر الآمن)',
    code:
`// قالب: يستخدم جسر MF لاستدعاء نموذج الذكاء (بدون وصول مباشر لمفتاحك)
document.body.innerHTML = \`
  <textarea id="q" style="width:100%;height:70px;font-family:sans-serif" placeholder="اسأل شيئاً..."></textarea>
  <button id="ask" style="margin-top:8px;padding:8px 16px">اسأل</button>
  <p id="a" style="font-family:sans-serif;white-space:pre-wrap"></p>
\`;
document.getElementById('ask').onclick = () => {
  MF.ask(document.getElementById('q').value).then(answer => {
    document.getElementById('a').textContent = answer;
  });
};`
  },
  blank: { label: 'كود حر فارغ', code: `// اكتب كودك الحر هنا (HTML/CSS/JS داخل نفس الملف)\n` }
};

function buildSandboxHTML(userCode){
  // جسر MF محدود: postMessage فقط، لا وصول لمفاتيح API أو localStorage الأصلي
  return `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8">
  <style>body{background:#0E0C08;color:#EDE6D6;font-family:sans-serif;margin:0;padding:14px;}</style>
  </head><body>
  <script>
    const MF = {
      ask(question){
        return new Promise((resolve) => {
          const id = 'req_' + Math.random().toString(36).slice(2);
          function handler(e){
            if (e.data && e.data.__mfPluginReply === id){
              window.removeEventListener('message', handler);
              resolve(e.data.answer);
            }
          }
          window.addEventListener('message', handler);
          window.parent.postMessage({ __mfPluginRequest: id, type: 'ask', question }, '*');
        });
      }
    };
    try {
      ${userCode}
    } catch(err){
      document.body.innerHTML = '<pre style="color:#e08">' + err.message + '</pre>';
    }
  </script>
  </body></html>`;
}

function runPluginSandboxed(code, container, providerId){
  container.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.sandbox = 'allow-scripts';
  iframe.style.width = '100%';
  iframe.style.height = '360px';
  iframe.style.border = '1px solid var(--line)';
  iframe.style.borderRadius = '10px';
  iframe.srcdoc = buildSandboxHTML(code);
  container.appendChild(iframe);

  // جسر الرسائل: فقط 'ask' مسموح، ويمر عبر callLLM الحقيقي بمفتاح المستخدم نفسه
  const bridgeHandler = async (e) => {
    if (!e.data || !e.data.__mfPluginRequest) return;
    if (e.source !== iframe.contentWindow) return;
    let answer = '⚠ غير مدعوم.';
    try {
      if (e.data.type === 'ask'){
        answer = await callLLM(providerId, [{ role: 'user', content: e.data.question }]);
      }
    } catch (err){
      answer = '⚠ ' + err.message;
    }
    iframe.contentWindow.postMessage({ __mfPluginReply: e.data.__mfPluginRequest, answer }, '*');
  };
  window.addEventListener('message', bridgeHandler);
  return () => window.removeEventListener('message', bridgeHandler);
}

// ---------- تخزين الإضافات ----------
async function savePlugin({ id, name, description, code, visibility }){
  const profile = await Auth.currentProfile();
  if (!profile) throw new Error('يجب تسجيل الدخول.');
  const plugin = {
    id: id || 'plg_' + Date.now(),
    owner_id: profile.id,
    owner_email: profile.email,
    name, description, code, visibility: visibility || 'private',
    status: visibility === 'public' ? 'pending' : 'approved', // العلني يحتاج موافقة إدارة
    created_at: Date.now()
  };
  if (Auth.mode() === 'local-demo'){
    const list = JSON.parse(localStorage.getItem('mf_plugins') || '[]');
    const idx = list.findIndex(p => p.id === plugin.id);
    if (idx >= 0) list[idx] = plugin; else list.push(plugin);
    localStorage.setItem('mf_plugins', JSON.stringify(list));
    return plugin;
  }
  const supa = getSupa();
  const { error } = await supa.from('plugins').upsert(plugin);
  if (error) throw error;
  return plugin;
}

async function listMyPlugins(){
  const profile = await Auth.currentProfile();
  if (!profile) return [];
  if (Auth.mode() === 'local-demo'){
    return JSON.parse(localStorage.getItem('mf_plugins') || '[]').filter(p => p.owner_id === profile.id);
  }
  const supa = getSupa();
  const { data, error } = await supa.from('plugins').select('*').eq('owner_id', profile.id);
  if (error) throw error;
  return data;
}

async function listPublicApprovedPlugins(){
  if (Auth.mode() === 'local-demo'){
    return JSON.parse(localStorage.getItem('mf_plugins') || '[]').filter(p => p.visibility === 'public' && p.status === 'approved');
  }
  const supa = getSupa();
  const { data, error } = await supa.from('plugins').select('*').eq('visibility', 'public').eq('status', 'approved');
  if (error) throw error;
  return data;
}

async function listPendingPlugins(){
  if (Auth.mode() === 'local-demo'){
    return JSON.parse(localStorage.getItem('mf_plugins') || '[]').filter(p => p.status === 'pending');
  }
  const supa = getSupa();
  const { data, error } = await supa.from('plugins').select('*').eq('status', 'pending');
  if (error) throw error;
  return data;
}

async function setPluginStatus(pluginId, status){
  if (Auth.mode() === 'local-demo'){
    const list = JSON.parse(localStorage.getItem('mf_plugins') || '[]');
    const item = list.find(p => p.id === pluginId);
    if (item) item.status = status;
    localStorage.setItem('mf_plugins', JSON.stringify(list));
    return;
  }
  const supa = getSupa();
  const { error } = await supa.from('plugins').update({ status }).eq('id', pluginId);
  if (error) throw error;
}
