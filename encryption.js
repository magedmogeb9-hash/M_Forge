const crypto = require('crypto');

// AES-256-GCM - يوفر تشفير + تحقق من سلامة البيانات (authenticated encryption)
// المفتاح يجب أن يأتي من Secrets Manager في بيئة الإنتاج، وليس من .env مباشرة
const ALGORITHM = 'aes-256-gcm';

function getKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error('ENCRYPTION_KEY يجب أن يكون 32 حرف على الأقل - راجع .env.example');
  }
  return crypto.createHash('sha256').update(key).digest(); // يضمن مفتاح 32 بايت بالضبط
}

function encrypt(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // نخزن iv + authTag + النص المشفر معاً كسلسلة واحدة base64
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

function decrypt(payload) {
  const buffer = Buffer.from(payload, 'base64');
  const iv = buffer.subarray(0, 12);
  const authTag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };
