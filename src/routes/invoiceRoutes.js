const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const router = express.Router();

// Meniru POST /v2/invoices
router.post('/', invoiceController.createInvoice);

// Meniru GET /v2/invoices/:invoice_id
router.get('/:invoice_id', invoiceController.getInvoiceById);

// Meniru GET /v2/invoices
router.get('/', invoiceController.listInvoices);

// Meniru POST /v2/invoices/:invoice_id/expire!
router.post('/:invoice_id/expire!', invoiceController.expireInvoice);

// Tambahkan route lain yang dipilih

module.exports = router;