const vm = require('vm');

/**
 * ⚠️ تحذير أمني مهم جداً - اقرأ قبل استخدام هذه الوحدة في الإنتاج:
 *
 * وحدة `vm` المدمجة في Node.js تعزل نطاق المتغيرات (scope) فقط،
 * وهي *ليست* حاجز أمان حقيقي (security boundary). كود خبيث يقدر يهرب منها
 * عبر استغلال الـ prototype chain أو الوصول لـ process عبر constructor tricks.
 *
 * للاستخدام الحقيقي في الإنتاج يُنصح بشدة بأحد الخيارين:
 *   1) تشغيل الكود داخل عملية/حاوية Docker منفصلة تماماً (best practice)
 *      بصلاحيات محدودة جداً (no network, read-only fs, memory/cpu limits)
 *   2) استخدام مكتبة عزل حقيقية مثل `isolated-vm` (تعزل V8 isolate كامل)
 *
 * هذا الملف مخصص فقط كنقطة انطلاق للتطوير والاختبار المحلي،
 * وليس جاهزاً لتشغيل كود من مصدر غير موثوق في بيئة إنتاج حقيقية.
 */

const DEFAULT_TIMEOUT_MS = 2000;
const MAX_OUTPUT_CHARS = 5000; // يمنع تسجيل مخرجات ضخمة تُثقل قاعدة البيانات
const MAX_LOG_LINES = 100;

function runInSandbox(code, { timeout = DEFAULT_TIMEOUT_MS, context = {} } = {}) {
  const start = Date.now();
  const logs = [];

  // نوفر console محدود فقط (بدون أي وصول لـ require/process/fs)
  const sandbox = {
    console: {
      log: (...args) => {
        if (logs.length < MAX_LOG_LINES) logs.push(args.map(String).join(' '));
      },
    },
    ...context,
  };

  const vmContext = vm.createContext(sandbox);
  const truncate = (str) => (str && str.length > MAX_OUTPUT_CHARS ? `${str.slice(0, MAX_OUTPUT_CHARS)}... [مقصوص]` : str);

  try {
    const script = new vm.Script(code, { timeout });
    const result = script.runInContext(vmContext, { timeout });
    return {
      success: true,
      output: truncate(logs.join('\n')),
      result: truncate(typeof result === 'object' ? JSON.stringify(result) : String(result)),
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      success: false,
      output: truncate(logs.join('\n')),
      error: truncate(err.message),
      durationMs: Date.now() - start,
    };
  }
}

module.exports = { runInSandbox };
