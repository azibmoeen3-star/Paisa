const PaymentProvider = require('../models/paymentProvider.model');

const FIXED_PROVIDER_NAMES = ['JazzCash', 'Easypaisa', 'Nayapay', 'Sadapay', 'BankAccount'];

const placeholderProvider = (name) => ({
  name,
  accountName: '',
  accountNumber: '',
  instructions: ''
});

const getProviders = async () => {
  const providers = await PaymentProvider.find({ isActive: true, name: { $in: FIXED_PROVIDER_NAMES } });
  const byName = new Map(providers.map((p) => [p.name, p]));
  return FIXED_PROVIDER_NAMES.map((name) => byName.get(name) || placeholderProvider(name));
};

const updateProviderByName = async (name, updates) => {
  if (!FIXED_PROVIDER_NAMES.includes(name)) {
    const err = new Error('Invalid provider name');
    err.status = 400;
    throw err;
  }

  const safeUpdates = {
    accountName: updates.accountName ?? '',
    accountNumber: updates.accountNumber ?? '',
    instructions: updates.instructions ?? '',
    isActive: true
  };

  return PaymentProvider.findOneAndUpdate(
    { name },
    { $set: safeUpdates, $setOnInsert: { name } },
    { new: true, upsert: true }
  );
};

module.exports = {
  getProviders,
  updateProviderByName,
  FIXED_PROVIDER_NAMES
};
