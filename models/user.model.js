const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\d{11}$/, 'Phone number must be 11 digits']
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatarUrl: {
    type: String,
    default: null
  },
  money: {
    type: Number,
    default: 0
  },
  referralsCount: {
    type: Number,
    default: 0
  },
  referralIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  referredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  hasActivePlan: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
