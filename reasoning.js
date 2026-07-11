// ============ reasoning.js ============
// محرّك "التفكير العميق والعكسي": بدل ادعاء "احتمالات لا نهائية"، نطبّق تقنية
// حقيقية ومُثبتة: تكرار التحليل عبر طبقات متعددة، كل طبقة تتحقق أو تناقض
// الطبقة السابقة (Self-consistency + Adversarial critique + Hypothesis expansion).

const REASONING_STAGES = [
  {
    key: 'direct',
    label: '1) التحليل المباشر',
    buildPrompt: (q) => `حلّل السؤال التالي بشكل منطقي مباشر وقدّم أفضل إجابة أولية مع الخطوات:\n\n"${q}"`
  },
  {
    key: 'reverse',
    label: '2) النقد العكسي (Adversarial)',
    buildPrompt: (q, prev) => `هذا تحليل أولي لسؤال ما:\n"""${prev}"""\n\nمهمتك الآن: تصرّف كناقد صارم يحاول إثبات خطأ هذا التحليل. ابحث عن ثغرات منطقية، افتراضات غير مثبتة، أو حالات استثناء تُسقط الإجابة. اذكر أقوى 3 اعتراضات ممكنة.`
  },
  {
    key: 'hypotheses',
    label: '3) فرضيات بديلة',
    buildPrompt: (q, prev, critique) => `السؤال الأصلي: "${q}"\nالتحليل الأولي: """${prev}"""\nالاعتراضات عليه: """${critique}"""\n\nبناءً على الاعتراضات، ولّد 3 فرضيات/مسارات حل بديلة ومختلفة عن بعضها، كل واحدة بمنطق مختلف (رياضي، تجريبي، تاريخي/سياقي، حسب طبيعة السؤال).`
  },
  {
    key: 'synthesis',
    label: '4) التوليف النهائي',
    buildPrompt: (q, allSteps) => `السؤال: "${q}"\n\nإليك سلسلة التفكير الكاملة:\n${allSteps}\n\nالآن قدّم إجابة نهائية واحدة، دقيقة ومباشرة، توازن بين كل الطبقات أعلاه، مع ذكر أي قيود أو افتراضات ضرورية. اجعلها منظمة وقابلة للتنفيذ.`
  },
  {
    key: 'refine',
    label: '5) تنقيح إضافي',
    buildPrompt: (q, allSteps) => `راجع هذا الحل النهائي مرة أخيرة بحثاً عن أي تحسين رياضي أو منطقي إضافي يمكن إضافته، دون تغيير جوهر الإجابة:\n\n${allSteps}`
  }
];

async function runDeepReasoning(question, depth, providerId, onStep){
  const stages = REASONING_STAGES.slice(0, Math.max(1, Math.min(depth, REASONING_STAGES.length)));
  let history = [];
  let lastText = '';
  let critique = '';

  for (let i = 0; i < stages.length; i++){
    const stage = stages[i];
    let prompt;
    if (stage.key === 'direct') prompt = stage.buildPrompt(question);
    else if (stage.key === 'reverse') prompt = stage.buildPrompt(question, lastText);
    else if (stage.key === 'hypotheses') prompt = stage.buildPrompt(question, history[0]?.text || lastText, lastText);
    else prompt = stage.buildPrompt(question, history.map(h => `[${h.label}]\n${h.text}`).join('\n\n'));

    onStep && onStep({ label: stage.label, status: 'running' });

    const messages = [
      { role: 'system', content: 'أنت محرك تحليل منطقي دقيق. أجب بإيجاز ووضوح، بالعربية إذا كان السؤال بالعربية، مع استخدام القوانين الرياضية أو المنطقية ذات الصلة عند الحاجة.' },
      { role: 'user', content: prompt }
    ];

    const text = await callLLM(providerId, messages);
    history.push({ label: stage.label, text });
    lastText = text;
    if (stage.key === 'reverse') critique = text;

    onStep && onStep({ label: stage.label, status: 'done', text });
  }

  return history;
}
