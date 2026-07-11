// ============ codebuilder.js ============
// توليد كود عبر LLM، مع فصله إلى ملفات متعددة قابلة للتحميل فردياً أو كـ ZIP.

let mfCodeFiles = {}; // { filename: content }
let mfActiveFile = null;

const CODE_SYSTEM_PROMPT = `أنت مهندس برمجيات خبير. عند توليد كود، أعد الناتج **حصراً** بالصيغة التالية بدون أي شرح خارج الكتل:

===FILE: اسم_الملف.امتداد===
<المحتوى الكامل للملف>
===ENDFILE===

كرّر هذا القالب لكل ملف مطلوب (مثال: index.html, style.css, script.js أو main.py). لا تضف أي نص تمهيدي أو ختامي خارج كتل ===FILE===.`;

function parseFilesFromResponse(text){
  const files = {};
  const regex = /===FILE:\s*(.+?)\s*===([\s\S]*?)===ENDFILE===/g;
  let match;
  while ((match = regex.exec(text)) !== null){
    const name = match[1].trim();
    let content = match[2];
    content = content.replace(/^\n/, '').replace(/\n$/, '');
    files[name] = content;
  }
  if (Object.keys(files).length === 0){
    // fallback: لم يتبع الصيغة، احفظ كملف واحد
    files['generated.txt'] = text;
  }
  return files;
}

async function generateCode(prompt, lang, providerId){
  const langHint = { html: 'HTML/CSS/JS لصفحة ويب كاملة', python: 'Python', javascript: 'JavaScript/Node.js', react: 'React (مكوّن واحد قابل للتشغيل)' }[lang];
  const messages = [
    { role: 'system', content: CODE_SYSTEM_PROMPT },
    { role: 'user', content: `اكتب: ${prompt}\n\nاستخدم: ${langHint}` }
  ];
  const raw = await callLLM(providerId, messages);
  return parseFilesFromResponse(raw);
}

function renderFileTabs(){
  const container = document.getElementById('codeFileTabs');
  container.innerHTML = '';
  Object.keys(mfCodeFiles).forEach(name => {
    const tab = document.createElement('button');
    tab.className = 'file-tab' + (name === mfActiveFile ? ' active' : '');
    tab.textContent = name;
    tab.onclick = () => { mfActiveFile = name; renderFileTabs(); renderEditor(); };
    container.appendChild(tab);
  });
}

function renderEditor(){
  const editor = document.getElementById('codeEditor');
  editor.textContent = mfActiveFile ? (mfCodeFiles[mfActiveFile] || '') : '';
}

function downloadTextFile(filename, content){
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
