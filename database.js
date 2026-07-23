const mongoose = require('mongoose');
const config = require('./env');

// نحتفظ باتصال منفصل لكل وحدة (مهم جداً لوحدة البنوك مستقبلاً)
const connections = {};

async function connectCore() {
  if (connections.core) return connections.core;
  connections.core = await mongoose.createConnection(config.mongo.core).asPromise();
  console.log('✅ Connected to CORE database');
  return connections.core;
}

async function connectEcommerce() {
  if (connections.ecommerce) return connections.ecommerce;
  connections.ecommerce = await mongoose.createConnection(config.mongo.ecommerce).asPromise();
  console.log('✅ Connected to ECOMMERCE database');
  return connections.ecommerce;
}

async function connectSocial() {
  if (connections.social) return connections.social;
  connections.social = await mongoose.createConnection(config.mongo.social).asPromise();
  console.log('✅ Connected to SOCIAL database');
  return connections.social;
}

async function connectAds() {
  if (connections.ads) return connections.ads;
  connections.ads = await mongoose.createConnection(config.mongo.ads).asPromise();
  console.log('✅ Connected to ADS database');
  return connections.ads;
}

// قاعدة بيانات البنوك الرقمية معزولة تماماً بأعلى درجة أهمية - لا تُشارك أي اتصال مع وحدة أخرى
async function connectBanking() {
  if (connections.banking) return connections.banking;
  connections.banking = await mongoose.createConnection(config.mongo.banking).asPromise();
  console.log('✅ Connected to BANKING database (isolated)');
  return connections.banking;
}

module.exports = { connectCore, connectEcommerce, connectSocial, connectAds, connectBanking, connections };
