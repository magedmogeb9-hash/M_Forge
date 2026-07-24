// معالج أخطاء موحد - يمنع تسرب تفاصيل حساسة (stack traces) في بيئة الإنتاج
module.exports = function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  const isProd = process.env.NODE_ENV === 'production';
  const status = err.status || 500;

  res.status(status).json({
    error: err.publicMessage || 'حدث خطأ في الخادم',
    ...(isProd ? {} : { detail: err.message, stack: err.stack }),
  });
};
