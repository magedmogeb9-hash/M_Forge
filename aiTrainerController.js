const SkillService = require('../services/skillService');

function getService(req) {
  return new SkillService(req.app.locals.coreDb);
}

// يقترح كوداً أولياً (عبر Hugging Face المجاني) بناءً على وصف بالعربي أو الإنجليزي
exports.suggestCode = async (req, res, next) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'يجب إرسال description' });
    const suggestion = await getService(req).suggestCode(description);
    res.json(suggestion);
  } catch (err) {
    next(err);
  }
};

exports.createSkill = async (req, res, next) => {
  try {
    const skill = await getService(req).createSkill({ ...req.body, createdBy: req.user.id });
    res.status(201).json(skill);
  } catch (err) {
    next(err);
  }
};

exports.listSkills = async (req, res, next) => {
  try {
    const { enabled } = req.query;
    const filter = enabled === undefined ? {} : { enabled: enabled === 'true' };
    const skills = await getService(req).listSkills(filter);
    res.json(skills);
  } catch (err) {
    next(err);
  }
};

exports.getSkill = async (req, res, next) => {
  try {
    const skill = await getService(req).getSkill(req.params.id);
    if (!skill) return res.status(404).json({ error: 'المهارة غير موجودة' });
    res.json(skill);
  } catch (err) {
    next(err);
  }
};

// نقطة النهاية الأهم: تنفيذ الكود المُرسَل من "نافذة الأمر" داخل بيئة معزولة واختبار النتيجة
exports.testSkill = async (req, res, next) => {
  try {
    const { skill, result } = await getService(req).testSkill(req.params.id, req.body.testContext || {});
    res.json({ skill, result });
  } catch (err) {
    next(err);
  }
};

exports.enableSkill = async (req, res, next) => {
  try {
    const skill = await getService(req).enableSkill(req.params.id);
    res.json(skill);
  } catch (err) {
    next(err);
  }
};

exports.disableSkill = async (req, res, next) => {
  try {
    const skill = await getService(req).disableSkill(req.params.id);
    res.json(skill);
  } catch (err) {
    next(err);
  }
};

exports.updateCode = async (req, res, next) => {
  try {
    const skill = await getService(req).updateCode(req.params.id, req.body.code);
    res.json(skill);
  } catch (err) {
    next(err);
  }
};

exports.deleteSkill = async (req, res, next) => {
  try {
    await getService(req).deleteSkill(req.params.id);
    res.json({ message: 'تم حذف المهارة' });
  } catch (err) {
    next(err);
  }
};
