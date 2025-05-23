const express = require('express');
const app = express();

// Middleware untuk membaca JSON body
app.use(express.json());
// Middleware untuk membaca URL-encoded body
app.use(express.urlencoded({ extended: true }));

// Contoh route sederhana
app.get('/', (req, res) => {
  res.send('Selamat Datang di API UTS Backend!');
});

// Di src/app.js (setelah middleware)
const invoiceRoutes = require('./routes/invoiceRoutes');
const virtualaccountRoutes = require('./routes/virtualaccountRoutes');

// ... (route lainnya jika ada)

app.use('/v2/invoices', invoiceRoutes); 
app.use('/callback_virtual_accounts', virtualaccountRoutes); 
// Prefix sesuai API Xendit
// app.use('/disbursements', disbursementRoutes); // Contoh
module.exports = app;

