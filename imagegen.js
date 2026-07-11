// ============ imagegen.js ============
// توليد صور مجاني بالكامل بدون مفتاح API عبر Pollinations.ai
// ملاحظة صادقة: لا يوجد "فيديو 4D" مجاني حقيقي. للتصوّر المتحرك انظر scene3d.js

function buildPollinationsURL(prompt, width, height, style){
  const fullPrompt = style ? `${prompt}, ${style}` : prompt;
  const encoded = encodeURIComponent(fullPrompt);
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
}

async function generateImage(prompt, width, height, style){
  const url = buildPollinationsURL(prompt, width, height, style);
  // Pollinations يولّد عند الطلب مباشرة عبر الرابط، نتأكد فقط أنه يُحمَّل
  await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = () => reject(new Error('تعذّر توليد الصورة، حاول مرة أخرى أو غيّر الوصف.'));
    img.src = url;
  });
  return url;
}
