const mongoose = require('mongoose');

const { Schema } = mongoose;

const whatsappLinkSchema = new Schema({
  key: {
    type: String,
    enum: ['chat', 'channel'],
    default: null
  },
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
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

const WhatsappLink = mongoose.model('WhatsappLink', whatsappLinkSchema);

module.exports = WhatsappLink;
