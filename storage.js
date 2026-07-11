// ============ storage.js ============
// إدارة مفاتيح API (localStorage) وإدارة الملفات/المشاريع (IndexedDB)
// كل شيء محلي بالكامل داخل متصفح المستخدم.

const Keys = {
  get(provider){ return localStorage.getItem('mf_key_' + provider) || ''; },
  set(provider, value){ localStorage.setItem('mf_key_' + provider, value); },
  all(){
    return {
      groq: Keys.get('groq'),
      gemini: Keys.get('gemini'),
      openrouter: Keys.get('openrouter'),
    };
  }
};

const DB = (() => {
  let dbPromise = null;
  function open(){
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open('mogibforge_db', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('nodes')) {
          db.createObjectStore('nodes', { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  async function tx(storeName, mode){
    const db = await open();
    return db.transaction(storeName, mode).objectStore(storeName);
  }

  return {
    async put(node){
      const store = await tx('nodes', 'readwrite');
      return new Promise((res, rej) => {
        const r = store.put(node);
        r.onsuccess = () => res(node);
        r.onerror = () => rej(r.error);
      });
    },
    async delete(id){
      const store = await tx('nodes', 'readwrite');
      return new Promise((res, rej) => {
        const r = store.delete(id);
        r.onsuccess = () => res();
        r.onerror = () => rej(r.error);
      });
    },
    async all(){
      const store = await tx('nodes', 'readonly');
      return new Promise((res, rej) => {
        const r = store.getAll();
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
    }
  };
})();
