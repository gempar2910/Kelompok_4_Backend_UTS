const express = require('express');
const router = express.Router();
const virtualAccountController = require('../controllers/virtualaccountController');

// Endpoint untuk membuat Virtual Account
router.post('/', virtualAccountController.createVirtualAccount);

module.exports = router;
