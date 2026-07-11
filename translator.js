// ============ translator.js ============
// ترجمة نصوص عادية عبر MyMemory (مجاني بدون مفتاح API).
// تحليل المخطوطات/الأسئلة الغامضة يُمرَّر إلى محرك التفكير العميق (reasoning.js).

async function translateText(text, from, to){
  const langPair = `${from === 'auto' ? 'autodetect' : from}|${to}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('تعذّر الوصول لخدمة الترجمة.');
  const data = await res.json();
  if (!data.responseData) throw new Error('لم يتم إرجاع ترجمة صالحة.');
  return data.responseData.translatedText;
}

async function analyzeManuscript(text, providerId, onStep){
  const question = `النص/الرمز/السؤال التالي غامض أو غير مألوف. حلّله لغوياً وسياقياً وتاريخياً إن أمكن، وإذا كان قابلاً للحل بكود بسيط (مثل شيفرة أو نمط رياضي) فاكتب ذلك الكود:\n\n"""${text}"""`;
  return runDeepReasoning(question, 3, providerId, onStep);
}
