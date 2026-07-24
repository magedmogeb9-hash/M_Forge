const getSkillModel = require('../models/Skill');
const { runInSandbox } = require('./sandboxService');
const huggingFaceAdapter = require('./huggingFaceAdapter');

class SkillService {
  constructor(connection) {
    this.Skill = getSkillModel(connection);
  }

  // يقترح كوداً أولياً عبر Hugging Face (مجاني) بناءً على وصف نصي - اقتراح فقط، لا يُحفظ أو يُنفَّذ تلقائياً
  async suggestCode(description) {
    return huggingFaceAdapter.suggestSkillCode({ description });
  }

  async createSkill({ name, description, code, createdBy }) {
    return this.Skill.create({ name, description, code, createdBy, enabled: false });
  }

  async listSkills({ enabled } = {}) {
    const filter = typeof enabled === 'boolean' ? { enabled } : {};
    return this.Skill.find(filter).select('-code').sort({ createdAt: -1 });
  }

  async getSkill(id) {
    return this.Skill.findById(id);
  }

  // ينفذ الكود في بيئة معزولة (sandbox) ويحفظ نتيجة الاختبار دون تفعيله تلقائياً
  async testSkill(id, testContext = {}) {
    const skill = await this.Skill.findById(id);
    if (!skill) throw Object.assign(new Error('المهارة غير موجودة'), { status: 404 });

    const result = runInSandbox(skill.code, { context: testContext });

    const record = {
      success: result.success,
      output: result.output,
      error: result.error,
      durationMs: result.durationMs,
      testedAt: new Date(),
    };

    skill.lastTestResult = record;
    skill.testHistory.push(record);
    // نحتفظ بآخر 50 محاولة فقط لتفادي تضخم المستند
    if (skill.testHistory.length > 50) {
      skill.testHistory = skill.testHistory.slice(-50);
    }
    await skill.save();
    return { skill, result };
  }

  // التفعيل يتطلب اجتياز اختبار ناجح أولاً - قاعدة أمان بسيطة لكن مهمة
  async enableSkill(id) {
    const skill = await this.Skill.findById(id);
    if (!skill) throw Object.assign(new Error('المهارة غير موجودة'), { status: 404 });
    if (!skill.lastTestResult || !skill.lastTestResult.success) {
      throw Object.assign(new Error('لا يمكن تفعيل مهارة لم تنجح في الاختبار بعد'), { status: 400 });
    }
    skill.enabled = true;
    await skill.save();
    return skill;
  }

  async disableSkill(id) {
    return this.Skill.findByIdAndUpdate(id, { enabled: false }, { new: true });
  }

  async updateCode(id, code) {
    // أي تعديل على الكود يعيد تعطيل المهارة تلقائياً حتى تُختبر من جديد
    return this.Skill.findByIdAndUpdate(
      id,
      { code, enabled: false, $inc: { version: 1 }, lastTestResult: null },
      { new: true }
    );
  }

  async deleteSkill(id) {
    return this.Skill.findByIdAndDelete(id);
  }
}

module.exports = SkillService;
