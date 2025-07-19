
// 🌐 Third-Party Dependencies
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// 🛠️ Internal Services & Utilities
const sendCredentialEmail = require('../../service/sendCredential');
const { sendOTPMPIN, sendOTPTXNPIN, sendOTPEmail } = require('../../service/sendMail');
const { generateRefreshToken, generateAccessToken, encryptDataFromText, generateApiTxnId } = require('../../service/token');
const generatePassword = require('../../service/passwordGenerator');

// 👥 Models
const Admin = require('../../model/adminModel');
const AccessModule = require('../../model/accessModule');
const User = require('../../model/userModel');
const Provider = require('../../model/providerModel');
const { unPayPayout } = require('../../gateWayProviders/unPayProvider');
const sequelize = require('../../config/sequelize');
const Transaction = require('../../model/Transaction');
const { rechargeKitPayout } = require('../../gateWayProviders/rechargeKitPayout');

const createPayoutByUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'user') {
      throw createError(403, 'Forbidden: only users can initiate payouts');
    }

    const result = await sequelize.transaction(async t => {
      // Lock user row for update
      const user = await User.findByPk(req.user.id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!user) throw createError(404, 'User not found');

      const amount = parseFloat(req.body.transaction_amount);
      if (user.topup < amount || user.topup === 0) {
        throw createError(400, 'Insufficient balance');
      }

      const txnId = generateApiTxnId();
 let bankParams = {};

// Set bankParams based on provider
if (req.body.providerKey === 'RECHARGEKIT_PAY') {
  bankParams = {
    mode: req.body.mode,
    name: req.body.beneficiaryname,
    account_no: req.body.accountnumber,
    bank_name: req.body.transfer_bank_name,
    ifsc: req.body.ifsc,
    mobile_no: req.body.mobile,
    beneficiary_name: req.body.beneficiaryname,
    amount,
    transfer_type: "5",
    partner_request_id: txnId
  };
} else {
  bankParams = {
    mode: req.body.mode,
    name: req.body.beneficiaryname,
    account: req.body.accountnumber,
    bank: req.body.transfer_bank_name,
    ifsc: req.body.ifsc,
    mobile: req.body.mobile,
    amount,
    apitxnid: txnId
  };
}

// ✅ Now bankParams is accessible here
const transactionRecord = await Transaction.create({
  user_id: req.user.id,
  transactionDate: new Date(),
  transactionId: txnId,
  gatwayId: txnId,
  orderId: txnId,
  mode: req.body.mode,
  bankDetails: bankParams,
  amount,
  status: 0, // pending
  apiName: req.body.providerKey,
}, { transaction: t });

// Call external payout API (outside of DB context)
let apiResult;
if (req.body.providerKey === 'RECHARGEKIT_PAY') {
  apiResult = await rechargeKitPayout(req.body.providerKey, bankParams);
} else {
  apiResult = await unPayPayout(req.body.providerKey, bankParams);
}

// NEW check for invalid apiResult
if (!apiResult || typeof apiResult !== 'object' || !apiResult.txn_status) {
  apiResult = {
    txn_status: 'FAILED',
    utr: '',
    acknowledged: '',
    message: 'Invalid or missing API response',
    full_response: {}
  };
}
      console.log("hello", apiResult);

      const statusMap = {
        SUCCESS: 1,
        PENDING: 0,
        FAILED: 2
      };
      const txnStatus = statusMap[apiResult.txn_status] ?? 0;

      // ✅ Deduct balance only if payout is not FAILED
      if (txnStatus !== 2) {
        user.topup -= amount;
        await user.save({ transaction: t });
      }

      // Update transaction with result
     await transactionRecord.update({
  status: txnStatus,
  utrNo: apiResult.utr,
  gst: apiResult.full_response?.gst || 0,
  tds: apiResult.full_response?.tds || 0,
  apiresponseDetails: apiResult.full_response || {} // ✅ Save full raw API response
}, { transaction: t });

      // If payout failed, rollback will still be prevented here — but topup won't be reduced
      return apiResult;
    });

    res.status(200).json({
      status: 200,
      message: 'Payout processed',
      data: result
    });

  } catch (err) {
    next(err);
  }
};



module.exports = {
createPayoutByUser
}