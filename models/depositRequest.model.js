const mongoose = require('mongoose');

const { Schema } = mongoose;

const depositRequestSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  plan: {
    type: Schema.Types.ObjectId,
    ref: 'InvestmentPlan',
    default: null
  },
  transactionId: {
    type: String,
    required: true,
    trim: true
  },
  accountDetails: {
    type: String,
    trim: true
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

const DepositRequest = mongoose.model('DepositRequest', depositRequestSchema);

module.exports = DepositRequest;
