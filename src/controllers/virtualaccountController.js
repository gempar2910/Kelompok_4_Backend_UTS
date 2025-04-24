// virtualAccountControllers.js

const VirtualAccount = require('../models/VirtualAccount'); // Assuming you have this model
// Tambahkan helper/util lain jika perlu

// Meniru POST /callback_virtual_accounts (atau endpoint serupa)
exports.createVirtualAccount = async (req, res) => {
  try {
    // 1. Validasi input (req.body) - penting!
    const { external_id, bank_code, name, amount } = req.body; // Sesuaikan field sesuai kebutuhan VA
    if (!external_id || !bank_code || !name) {
      return res.status(400).json({ error_code: 'VALIDATION_ERROR', message: 'Missing required fields: external_id, bank_code, name are required' });
    }

    // 2. Cek apakah external_id sudah ada (idempotency key)
    const existingVA = await VirtualAccount.findOne({ external_id });
    if (existingVA) {
      // Return existing VA data if it's already created (common practice for idempotency)
      // Format the response similar to a new creation
      const existingResponse = {
        id: existingVA._id,
        owner_id: existingVA.owner_id || 'dummy_owner_id_456', // Use stored or default
        external_id: existingVA.external_id,
        bank_code: existingVA.bank_code,
        merchant_code: existingVA.merchant_code || 'YOUR_MERCHANT_CODE', // Use stored or default
        name: existingVA.name,
        account_number: existingVA.virtual_account_number,
        is_closed: existingVA.is_closed !== undefined ? existingVA.is_closed : true, // Default VA type (closed)
        expected_amount: existingVA.amount, // Map amount to expected_amount if needed
        expiration_date: existingVA.expiration_date ? existingVA.expiration_date.toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Use stored or generate new
        is_single_use: existingVA.is_single_use !== undefined ? existingVA.is_single_use : true, // Default VA type
        status: existingVA.status,
        currency: existingVA.currency || 'IDR', // Use stored or default
        created: existingVA.created.toISOString(),
        updated: existingVA.updated.toISOString(),
        // Add other fields if needed
      };
      // Xendit often returns 200 OK even for duplicate external_id if it matches
      return res.status(200).json(existingResponse);
      // Alternatively, return a specific error:
      // return res.status(400).json({ error_code: 'DUPLICATE_CALLBACK_VIRTUAL_ACCOUNT_ERROR', message: 'Virtual Account with this external_id already exists' });
    }

    // 3. Buat data Virtual Account baru di DB
    const ownerId = 'dummy_owner_id_456'; // Hardcode atau dari config/auth
    const merchantCode = 'YOUR_MERCHANT_CODE'; // Hardcode atau dari config
    const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Contoh expire 1 hari
    // Generate VA number (contoh sederhana, sesuaikan dengan format bank)
    const virtualAccountNumber = `${bank_code}${Math.random().toString().slice(2, 12)}`; // Contoh: BCA1234567890

    const newVAData = {
      external_id,
      owner_id: ownerId,
      bank_code,
      name,
      amount, // Simpan amount jika diberikan (untuk fixed VA)
      virtual_account_number: virtualAccountNumber,
      status: 'PENDING', // Status awal VA (bisa jadi 'ACTIVE' tergantung flow)
      merchant_code: merchantCode,
      currency: 'IDR', // Default atau dari request
      is_closed: true, // Tipe VA default (fixed amount)
      is_single_use: true, // Tipe VA default
      expiration_date: expirationDate,
      // Tambahkan field lain dari model jika ada
    };
    const virtualAccount = new VirtualAccount(newVAData);
    await virtualAccount.save();

    // Biasanya VA langsung aktif setelah dibuat, update status jika perlu
    virtualAccount.status = 'ACTIVE';
    await virtualAccount.save();


    // 4. Format respons agar mirip Xendit VA Callback response
    const response = {
      id: virtualAccount._id, // ID internal database
      owner_id: virtualAccount.owner_id,
      external_id: virtualAccount.external_id,
      bank_code: virtualAccount.bank_code,
      merchant_code: virtualAccount.merchant_code,
      name: virtualAccount.name,
      account_number: virtualAccount.virtual_account_number, // Nama field VA di Xendit
      is_closed: virtualAccount.is_closed,
      expected_amount: virtualAccount.amount, // Map 'amount' ke 'expected_amount' jika diperlukan
      expiration_date: virtualAccount.expiration_date.toISOString(),
      is_single_use: virtualAccount.is_single_use,
      status: virtualAccount.status,
      currency: virtualAccount.currency,
      created: virtualAccount.created.toISOString(),
      updated: virtualAccount.updated.toISOString(),
      // Tambahkan field lain jika perlu ditiru
    };

    res.status(200).json(response); // Xendit VA Creation biasanya return 200 OK

  } catch (error) {
    console.error("Error creating virtual account:", error);
    res.status(500).json({ error_code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};

// Meniru GET /callback_virtual_accounts/:id (atau endpoint serupa)
exports.getVirtualAccount = async (req, res) => {
  try {
    // ID bisa dari MongoDB (_id) atau external_id, tergantung desain API Anda
    // Contoh ini menggunakan MongoDB _id
    const { va_id } = req.params; // Menggunakan _id dari MongoDB sebagai :id
    const virtualAccount = await VirtualAccount.findById(va_id);

    // Alternatif: Cari berdasarkan external_id jika itu yang diinginkan
    // const { external_id } = req.query; // atau req.params
    // const virtualAccount = await VirtualAccount.findOne({ external_id: external_id });

    if (!virtualAccount) {
      return res.status(404).json({ error_code: 'VIRTUAL_ACCOUNT_NOT_FOUND_ERROR', message: 'Virtual Account not found' });
    }

    // Format respons agar mirip Xendit (sama seperti di createVirtualAccount)
    const response = {
        id: virtualAccount._id,
        owner_id: virtualAccount.owner_id,
        external_id: virtualAccount.external_id,
        bank_code: virtualAccount.bank_code,
        merchant_code: virtualAccount.merchant_code,
        name: virtualAccount.name,
        account_number: virtualAccount.virtual_account_number,
        is_closed: virtualAccount.is_closed,
        expected_amount: virtualAccount.amount, // Map amount ke expected_amount jika perlu
        expiration_date: virtualAccount.expiration_date ? virtualAccount.expiration_date.toISOString() : null,
        is_single_use: virtualAccount.is_single_use,
        status: virtualAccount.status,
        currency: virtualAccount.currency,
        created: virtualAccount.created.toISOString(),
        updated: virtualAccount.updated.toISOString(),
        // Tambahkan field lain jika perlu ditiru
    };

    res.status(200).json(response);

  } catch (error) {
    console.error("Error getting virtual account:", error);
    // Handle jika ID tidak valid formatnya (CastError)
    if (error.name === 'CastError') {
        return res.status(404).json({ error_code: 'INVALID_ID_FORMAT', message: 'Invalid Virtual Account ID format' });
        // Atau tetap VIRTUAL_ACCOUNT_NOT_FOUND_ERROR agar tidak membocorkan detail
        // return res.status(404).json({ error_code: 'VIRTUAL_ACCOUNT_NOT_FOUND_ERROR', message: 'Virtual Account not found' });
    }
    res.status(500).json({ error_code: 'SERVER_ERROR', message: 'Internal server error' });
  }
};

// Implementasikan fungsi controller lain jika perlu
// (misal: updateVirtualAccount, listVirtualAccounts, simulatePaymentCallback, dll.)
// ...