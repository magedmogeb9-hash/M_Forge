const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    code: { type: String, required: true }, // كود JavaScript يُنفَّذ داخل بيئة معزولة (sandbox)
    version: { type: Number, default: 1 },
    enabled: { type: Boolean, default: false }, // يبقى معطّل حتى يُختبر بنجاح
    lastTestResult: {
      success: { type: Boolean },
      output: { type: String },
      error: { type: String },
      durationMs: { type: Number },
      testedAt: { type: Date },
    },
    // سجل تدقيق كامل لكل محاولات التنفيذ - مهم لمراجعة أي مهارة قبل تفعيلها أو عند الشك بسلوكها
    testHistory: [
      {
        success: Boolean,
        output: String,
        error: String,
        durationMs: Number,
        testedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

module.exports = function getSkillModel(connection) {
  return connection.model('Skill', skillSchema);
};
