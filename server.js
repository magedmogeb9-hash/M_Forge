const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const config = require('./config/env');
const { connectCore, connectEcommerce, connectSocial, connectAds, connectBanking } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const productRoutes = require('../modules/ecommerce/routes/productRoutes');
const socialRoutes = require('../modules/social/routes/socialRoutes');
const adsRoutes = require('../modules/ads/routes/adsRoutes');
const bankingRoutes = require('../modules/banking/routes/bankingRoutes');
const aiTrainerRoutes = require('../modules/ai-trainer/routes/aiTrainerRoutes');

async function start() {
  const app = express();

  // ==== أمان أساسي ====
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      message: { error: 'عدد كبير من الطلبات، حاول لاحقاً' },
    })
  );

  // ==== الاتصال بقواعد البيانات (منفصلة تماماً لكل وحدة) ====
  app.locals.coreDb = await connectCore();
  app.locals.ecommerceDb = await connectEcommerce();
  app.locals.socialDb = await connectSocial();
  app.locals.adsDb = await connectAds();
  app.locals.bankingDb = await connectBanking(); // معزولة بأعلى درجة أمان

  // ==== الوحدات ====
  app.use('/api/ecommerce/products', productRoutes);
  app.use('/api/social', socialRoutes);
  app.use('/api/ads', adsRoutes);
  app.use('/api/banking', bankingRoutes);
  app.use('/api/ai-trainer', aiTrainerRoutes);

  app.get('/health', (req, res) => res.json({ status: 'ok', env: config.env }));

  // ==== معالج الأخطاء دائماً في النهاية ====
  app.use(errorHandler);

  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port} [${config.env}]`);
    console.log('الوحدات المفعّلة: ecommerce, social, ads, banking, ai-trainer');
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
