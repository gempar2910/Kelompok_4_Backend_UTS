const Invoice = require('../models/Invoice');
// Tambahkan helper/util lain jika perlu

// Meniru POST /v2/invoices
exports.createInvoice = async (req, res) => {
  try {
    // 1. Validasi input (req.body) - penting!
    const { external_id, amount, payer_email, description } = req.body;
    if (!external_id || !amount) {
      return res.status(400).json({ error_code: 'VALIDATION_ERROR', message: 'Missing required fields' });
    }

    // 2. Cek apakah external_id sudah ada (opsional, tergantung logika Xendit)
    const existingInvoice = await Invoice.findOne({ external_id });
    if (existingInvoice) {
      return res.status(400).json({ error_code: 'DUPLICATE_INVOICE_ERROR', message: 'Invoice with this external_id already exists' });
    }

    // 3. Buat data invoice baru di DB
    const newInvoiceData = {
      external_id,
      amount,
      payer_email,
      description,
      status: 'PENDING', // Status awal
      // Generate invoice_url unik (misal: /invoices/view/{mongo_db_id})
      invoice_url: `/invoices/view/temp_${external_id}` // Contoh sementara
    };
    const invoice = new Invoice(newInvoiceData);
    await invoice.save();

    // Update invoice_url dengan ID asli dari MongoDB
    invoice.invoice_url = `https://yourdomain.com/invoices/view/${invoice._id}`; // Ganti domain
    await invoice.save();


    // 4. Format respons agar mirip Xendit
    const response = {
      id: invoice._id, // Atau gunakan format ID Xendit jika perlu ditiru
      external_id: invoice.external_id,
      user_id: 'dummy_user_id_123', // Hardcode atau dari config
      status: invoice.status,
      merchant_name: 'Nama Toko UTS Anda', // Hardcode atau dari config
      amount: invoice.amount,
      payer_email: invoice.payer_email,
      description: invoice.description,
      expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Contoh expire 1 hari
      invoice_url: invoice.invoice_url,
      available_banks: [], // Tiru jika perlu
      available_retail_outlets: [], // Tiru jika perlu
      available_ewallets: [], // Tiru jika perlu
      should_exclude_credit_card: false, // Tiru jika perlu
      should_send_email: false, // Tiru jika perlu
      created: invoice.created.toISOString(),
      updated: invoice.updated.toISOString(),
      currency: 'IDR' // Tiru jika perlu
    };

    res.status(201).json(response); // 201 Created

  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ error_code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};

// Meniru GET /v2/invoices/:invoice_id
exports.getInvoiceById = async (req, res) => {
  try {
    const { invoice_id } = req.params; // Ini bisa ID MongoDB atau external_id, sesuaikan logika Anda
    const invoice = await Invoice.findById(invoice_id); // Atau findOne({ external_id: invoice_id })

    if (!invoice) {
      return res.status(404).json({ error_code: 'INVOICE_NOT_FOUND_ERROR', message: 'Invoice not found' });
    }

    // Format respons agar mirip Xendit (sama seperti di createInvoice)
    const response = { /* ... format data invoice seperti di atas ... */ };
     res.status(200).json(response);

  } catch (error) {
     console.error("Error getting invoice:", error);
     // Handle jika ID tidak valid formatnya (CastError)
     if (error.name === 'CastError') {
          return res.status(404).json({ error_code: 'INVOICE_NOT_FOUND_ERROR', message: 'Invoice not found' });
     }
     res.status(500).json({ error_code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};

// Implementasikan fungsi controller lain (listInvoices, expireInvoice, dll.)
// ...