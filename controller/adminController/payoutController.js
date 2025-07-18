
// 🌐 Third-Party Dependencies
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// 🛠️ Internal Services & Utilities
const sendCredentialEmail = require('../../service/sendCredential');
const { sendOTPMPIN, sendOTPTXNPIN, sendOTPEmail } = require('../../service/sendMail');
const { generateRefreshToken, generateAccessToken, encryptDataFromText } = require('../../service/token');
const generatePassword = require('../../service/passwordGenerator');

// 👥 Models
const Admin = require('../../model/adminModel');
const AccessModule = require('../../model/accessModule');
const User = require('../../model/userModel');
const Provider = require('../../model/providerModel');
const { unPayPayout } = require('../../gateWayProviders/unPayProvider');

const createPayoutByUser=async (req,res,next)=>{
  try {
    if (req.user.role !== 'user') {
      throw createError(403, 'Forbidden: only users can initiate payouts');
    }

    // Wrap reduced balance update + payout record + provider call in a transaction
    const result = await sequelize.transaction(async t => {
      const user = await User.findByPk(req.user.id, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });
      if (!user) throw createError(404, 'User not found');

      const amount = Number(req.body.transaction_amount);
      if (user.topup < amount) {
        throw createError(400, 'Insufficient balance');
      }

      // Deduct balance
      user.topup -= amount;
      await user.save({ transaction: t });

      // Prepare and perform payout
      const txnId = generateApiTxnId();
      const params = { ...req.body, apitxnid: txnId };

      const apiResult = await payout(req.body.providerKey, params);

      // Record the transaction
      const tx = await VirtulaTransaction.create({
        user_id: user.id,
        virtual_id: txnId,
        amount,
        status: apiResult.txn_status === 'SUCCESS' ? 2 : 1,
        approved_by: null
      }, { transaction: t });

      return { apiResult, tx };
    });
    // If no error, transaction committed successfully

    return res.status(200).json({
      status: 200,
      message: 'Payout processed',
      data: result
    });
  } catch (err) {
    next(err);
  }
}


module.exports = {
createPayoutByUser
}