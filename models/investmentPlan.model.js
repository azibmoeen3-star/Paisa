const mongoose = require('mongoose');

const { Schema } = mongoose;

const investmentPlanSchema = new Schema({
  invest: {
    type: Number,
    required: true,
    unique: true
  },
  daily: {
    type: Number,
    required: true
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

const InvestmentPlan = mongoose.model('InvestmentPlan', investmentPlanSchema);

module.exports = InvestmentPlan;