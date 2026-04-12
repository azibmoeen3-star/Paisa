const mongoose = require('mongoose');

const { Schema } = mongoose;

const withdrawRequestSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  accountDetails: {
    type: String,
    required: true,
    trim: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['easypaisa', 'jazzcash', 'nayapay', 'sadapay', 'bankaccount']
  },
  receiptUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNote: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date,
    default: null
  }
});

const WithdrawRequest = mongoose.model('WithdrawRequest', withdrawRequestSchema);

module.exports = WithdrawRequest;
