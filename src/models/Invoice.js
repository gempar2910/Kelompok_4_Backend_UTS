const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  external_id: { type: String, required: true, unique: true },
  user_id: { type: String }, // ID bisnis Xendit (bisa di-hardcode/abaikan)
  status: { type: String, default: 'PENDING' }, // Misal: PENDING, PAID, EXPIRED
  payer_email: { type: String },
  description: { type: String },
  amount: { type: Number, required: true },
  invoice_url: { type: String }, // URL unik yang Anda generate
  // Tambahkan field lain sesuai kebutuhan dari dokumentasi Xendit
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created', updatedAt: 'updated' } }); // Otomatis kelola created/updated

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;