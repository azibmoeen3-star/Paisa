const WhatsappLink = require('../models/whatsappLink.model');

const FIXED_WHATSAPP_KEYS = ['chat', 'channel'];

const placeholders = {
  chat: { key: 'chat', title: 'WhatsApp Chat', url: 'https://wa.me/0000000000' },
  channel: { key: 'channel', title: 'WhatsApp Channel', url: 'https://chat.whatsapp.com/xxxxxxxxxxxx' }
};

const getLinks = async () => {
  const links = await WhatsappLink.find({ isActive: true, key: { $in: FIXED_WHATSAPP_KEYS } });
  const byKey = new Map(links.map((l) => [l.key, l]));
  return FIXED_WHATSAPP_KEYS.map((key) => byKey.get(key) || placeholders[key]);
};

const updateLinkByKey = async (key, updates) => {
  if (!FIXED_WHATSAPP_KEYS.includes(key)) {
    const err = new Error('Invalid link key');
    err.status = 400;
    throw err;
  }

  const safeUpdates = {
    title: updates.title ?? placeholders[key].title,
    url: updates.url ?? placeholders[key].url,
    isActive: true
  };

  return WhatsappLink.findOneAndUpdate(
    { key },
    { $set: safeUpdates, $setOnInsert: { key } },
    { new: true, upsert: true }
  );
};

module.exports = {
  getLinks,
  updateLinkByKey,
  FIXED_WHATSAPP_KEYS
};
