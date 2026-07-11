// ============ filemanager.js ============
// إدارة المشاريع/المجلدات/الملفات — تُخزَّن محلياً في IndexedDB عبر storage.js

let mfCurrentFolder = null; // null = الجذر

function uid(){ return 'n_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); }

async function fmCreateProject(name){
  const node = { id: uid(), type: 'project', name, parentId: null, createdAt: Date.now() };
  await DB.put(node);
  return node;
}
async function fmCreateFolder(name, parentId){
  const node = { id: uid(), type: 'folder', name, parentId, createdAt: Date.now() };
  await DB.put(node);
  return node;
}
async function fmCreateFile(name, content, parentId){
  const node = { id: uid(), type: 'file', name, content, parentId, createdAt: Date.now() };
  await DB.put(node);
  return node;
}
async function fmDelete(id){
  const all = await DB.all();
  const children = all.filter(n => n.parentId === id);
  for (const c of children) await fmDelete(c.id);
  await DB.delete(id);
}

async function renderFilesExplorer(){
  const all = await DB.all();
  const container = document.getElementById('filesExplorer');
  container.innerHTML = '';

  const items = all.filter(n => n.parentId === mfCurrentFolder);

  if (mfCurrentFolder !== null){
    const back = document.createElement('div');
    back.className = 'folder-item';
    back.innerHTML = `<span class="file-icon">⬅</span><span>رجوع</span>`;
    back.onclick = async () => {
      const current = all.find(n => n.id === mfCurrentFolder);
      mfCurrentFolder = current ? current.parentId : null;
      renderFilesExplorer();
    };
    container.appendChild(back);
  }

  if (items.length === 0 && mfCurrentFolder === null){
    const empty = document.createElement('p');
    empty.style.color = 'var(--text-muted)';
    empty.textContent = 'لا توجد مشاريع بعد. أنشئ مشروعاً جديداً للبدء.';
    container.appendChild(empty);
    return;
  }

  items.forEach(node => {
    const el = document.createElement('div');
    el.className = node.type === 'file' ? 'file-item' : 'folder-item';
    const icon = node.type === 'project' ? '◈' : node.type === 'folder' ? '📁' : '📄';
    el.innerHTML = `<span class="file-icon">${icon}</span><span>${node.name}</span>`;
    el.onclick = () => {
      if (node.type === 'file'){
        // فتح الملف في محرر الأكواد
        mfCodeFiles = { [node.name]: node.content };
        mfActiveFile = node.name;
        document.querySelector('[data-view="code"]').click();
        renderFileTabs(); renderEditor();
      } else {
        mfCurrentFolder = node.id;
        renderFilesExplorer();
      }
    };
    el.oncontextmenu = (e) => {
      e.preventDefault();
      if (confirm(`حذف "${node.name}"؟`)) fmDelete(node.id).then(renderFilesExplorer);
    };
    container.appendChild(el);
  });
}
