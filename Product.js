const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    images: [{ type: String }],
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'draft' },
    externalId: { type: String }, // مرجع لمعرف المنتج في Shopify/WooCommerce إن وجد
  },
  { timestamps: true }
);

// دالة مساعدة لإنشاء الموديل على اتصال قاعدة بيانات محدد (اتصال الإيكوميرس المنفصل)
module.exports = function getProductModel(connection) {
  return connection.model('Product', productSchema);
};
