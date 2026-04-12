const mongoose = require('mongoose');

const { Schema } = mongoose;

const paymentProviderSchema = new Schema({
  name: {
    type: String,
    required: true,
    enum: ['JazzCash', 'Nayapay', 'Easypaisa', 'Sadapay', 'BankAccount']
  },
  accountName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    default: 'Send payment to this account and upload receipt with transaction ID.'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PaymentProvider = mongoose.model('PaymentProvider', paymentProviderSchema);

module.exports = PaymentProvider;
