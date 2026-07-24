const jwt = require('jsonwebtoken');
const config = require('../config/env');

// يتحقق من التوكن ويضيف معلومات المستخدم للـ request
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'مطلوب تسجيل الدخول' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'جلسة غير صالحة أو منتهية' });
  }
}

// يتحقق من صلاحية معينة (مثلاً فقط admin يقدر يوصل لوحدة البنوك)
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'لا تملك صلاحية الوصول لهذا المورد' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
