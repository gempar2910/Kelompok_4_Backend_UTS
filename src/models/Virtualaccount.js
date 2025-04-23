// models/VirtualAccount.js

const mongoose = require('mongoose');

const virtualAccountSchema = new mongoose.Schema({
  // --- Core VA Identifiers ---
  external_id: {
    type: String,
    required: [true, 'external_id is required.'], // Added custom error message
    unique: true,
    index: true // Index for faster lookups by external_id
  },
  owner_id: { // Often refers to the Xendit Business ID or your internal user ID
    type: String,
    required: [true, 'owner_id is required.']
  },
  bank_code: { // E.g., 'BCA', 'MANDIRI', 'BNI', 'PERMATA'
    type: String,
    required: [true, 'bank_code is required.']
  },
  merchant_code: { // Your Xendit merchant code (or similar identifier)
    type: String,
    required: [true, 'merchant_code is required.']
  },
  virtual_account_number: { // The generated VA number
    type: String,
    required: true,
    unique: true,
    index: true // Index for faster lookups by VA number
  },
  name: { // Name associated with the VA (e.g., customer name)
    type: String,
    required: [true, 'name is required.']
  },

  // --- VA Configuration & Status ---
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'PAID'], // Define possible statuses
    default: 'PENDING' // Initial status upon creation
  },
  currency: {
    type: String,
    default: 'IDR' // Default currency
  },
  is_closed: { // Determines if it's a fixed amount (closed) or open VA
    type: Boolean,
    default: true // Default to closed (fixed amount) VA
  },
  is_single_use: { // Determines if the VA can be paid multiple times
    type: Boolean,
    default: true // Default to single payment
  },
  expected_amount: { // The amount expected for closed VAs
    type: Number,
    // Make required only if is_closed is true (can be handled in application logic or pre-save hook)
    // required: function() { return this.is_closed; } // Example conditional requirement
    min: [0, 'Expected amount cannot be negative'] // Basic validation
  },
  expiration_date: { // When the VA expires
    type: Date,
    required: true
  },

  // --- Optional Fields (Add as needed) ---
  description: { // Optional description for the VA payment
    type: String
  },
  // You might add fields to store payment details when a payment is received
  // payment_id: { type: String },
  // paid_amount: { type: Number },
  // payment_timestamp: { type: Date },

  // --- Timestamps ---
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created', updatedAt: 'updated' } // Automatically manage created and updated fields
});

// --- Pre-save hook (optional) ---
// Example: Automatically set updated timestamp on modification
// virtualAccountSchema.pre('save', function(next) {
//   this.updated = Date.now();
//   next();
// });

// Example: Validate that expected_amount exists if is_closed is true
// virtualAccountSchema.pre('validate', function(next) {
//   if (this.is_closed && (this.expected_amount === undefined || this.expected_amount === null || this.expected_amount <= 0)) {
//     next(new Error('expected_amount is required and must be positive for closed virtual accounts.'));
//   } else {
//     next();
//   }
// });


const VirtualAccount = mongoose.model('VirtualAccount', virtualAccountSchema);

module.exports = VirtualAccount;
