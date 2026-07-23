const { request } = require('../../../core/utils/httpClient');

/**
 * Hugging Face Inference API - مجاني بالكامل عبر حساب شخصي مجاني على huggingface.co
 * (يوجد حد استخدام شهري مجاني كافٍ للتطوير والاختبار، بدون أي بطاقة دفع)
 * التوثيق: https://huggingface.co/docs/api-inference
 *
 * الاستخدام هنا: مساعدة "تدريب" المساعد عبر اقتراح كود JavaScript لمهارة جديدة
 * بناءً على وصف نصي يكتبه المستخدم - هذا الكود يُعرض للمستخدم فقط، ولا يُنفَّذ
 * أو يُفعَّل تلقائياً؛ يجب أن يمر لاحقاً عبر skillService.testSkill (بيئة معزولة) ثم enableSkill.
 */

const DEFAULT_MODEL = 'bigcode/starcoder2-3b';

function isConfigured() {
  return Boolean(process.env.HUGGINGFACE_API_TOKEN);
}

async function suggestSkillCode({ description, model = DEFAULT_MODEL }) {
  if (!isConfigured()) {
    throw Object.assign(new Error('HUGGINGFACE_API_TOKEN غير مهيأ - أضفه في .env (مجاني من huggingface.co)'), {
      status: 400,
    });
  }

  const prompt = `// اكتب دالة JavaScript واحدة فقط تنفذ ما يلي:\n// ${description}\n`;
  const data = await request({
    method: 'POST',
    url: `https://api-inference.huggingface.co/models/${model}`,
    headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}` },
    data: { inputs: prompt, parameters: { max_new_tokens: 200, temperature: 0.2 } },
  });

  const generated = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
  return { suggestedCode: generated || '', model };
}

module.exports = { isConfigured, suggestSkillCode };
