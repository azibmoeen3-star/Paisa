const Transaction = require('../models/transaction.model');

const createTransaction = async ({ userId, type, amount, balanceAfter }) => {
  const transaction = new Transaction({
    user: userId,
    type,
    amount,
    balanceAfter,
    currency: 'PKR'
  });
  return transaction.save();
};

const getTransactionsForUser = async (userId) => {
  return Transaction.find({ user: userId }).sort({ createdAt: -1 });
};

module.exports = {
  createTransaction,
  getTransactionsForUser
};
