const sequelize = require("../config/sequelize");
const User = require("../model/userModel");

async function transferFunds(fromId, bankDetails, amount) {
  return sequelize.transaction(async (t) => {
    const sender = await User.findByPk(fromId, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    const receiver = await Account.findByPk(bankDetails, {
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!sender || sender.balance < amount) {
      throw new Error('Insufficient funds');
    }

    // Perform debit and credit
    await sender.decrement({ balance: amount }, { transaction: t });
    await receiver.increment({ balance: amount }, { transaction: t });

    // Log the transactions
    await TransactionLog.create({
      accountId: fromId,
      type: 'debit',
      amount
    }, { transaction: t });

    await TransactionLog.create({
      accountId: bankDetails,
      type: 'credit',
      amount
    }, { transaction: t });

    return { sender, receiver };
  });
}

module.exports = {transferFunds};
