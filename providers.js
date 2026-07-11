// ============ providers.js ============
// طبقة موحّدة لاستدعاء عدة مزوّدين مجانيين للنماذج اللغوية.
// كل الاستدعاءات تتم مباشرة من متصفح المستخدم إلى مزوّد الـ API — لا خادم وسيط.

const PROVIDERS = {
  groq: {
    label: 'Groq (Llama 3.3 70B) — مجاني وسريع',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    async call(messages, key){
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify({ model: this.model, messages, temperature: 0.7 })
      });
      if (!res.ok) throw new Error('Groq API error: ' + res.status + ' — تحقق من المفتاح في الإعدادات');
      const data = await res.json();
      return data.choices[0].message.content;
    }
  },
  gemini: {
    label: 'Google Gemini 2.0 Flash — مجاني',
    async call(messages, key){
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
      const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
      const sys = messages.find(m => m.role === 'system');
      const body = { contents };
      if (sys) body.systemInstruction = { parts: [{ text: sys.content }] };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Gemini API error: ' + res.status + ' — تحقق من المفتاح في الإعدادات');
      const data = await res.json();
      return data.candidates[0].content.parts.map(p => p.text).join('\n');
    }
  },
  openrouter: {
    label: 'OpenRouter (نماذج :free متعددة)',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    async call(messages, key){
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify({ model: this.model, messages })
      });
      if (!res.ok) throw new Error('OpenRouter API error: ' + res.status + ' — تحقق من المفتاح في الإعدادات');
      const data = await res.json();
      return data.choices[0].message.content;
    }
  }
};

async function callLLM(providerId, messages){
  const provider = PROVIDERS[providerId];
  const key = Keys.get(providerId);
  if (!key) throw new Error('لم يتم ضبط مفتاح ' + providerId + '. اذهب إلى الإعدادات أولاً.');
  return provider.call(messages, key);
}

function anyKeyConfigured(){
  const k = Keys.all();
  return !!(k.groq || k.gemini || k.openrouter);
}
