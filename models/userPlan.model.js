const mongoose = require('mongoose');

const { Schema } = mongoose;

const userPlanSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: Schema.Types.ObjectId,
    ref: 'InvestmentPlan',
    required: true
  },
  invest: {
    type: Number,
    required: true,
    min: 1
  },
  daily: {
    type: Number,
    required: true,
    min: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  payoutAt: {
    type: Date,
    required: true
  },
  payoutCredited: {
    type: Boolean,
    default: false
  },
  creditedAt: {
    type: Date,
    default: null
  }
});

const UserPlan = mongoose.model('UserPlan', userPlanSchema);

module.exports = UserPlan;
