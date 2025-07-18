
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
      throw createError(403, 'Forbidden: only user can initiate payouts');
    }
    const txnId=await generateApiTxnId()

    const params = {
      mode: req.body.mode,
      name: req.body.beneficiaryname,
      account: req.body.accountnumber,
      bank: req.body.transfer_bank_name,
      ifsc: req.body.ifsc,
      mobile: req.body.phone,
      amount: req.body.transaction_amount,
      apitxnid: txnId
    };
//  if our internal calculation is done then we proceed to payment provider
    const result = await unPayPayout(req.body.providerKey, params);

    // You may want to log the request & response here for audit...

    return res.status(200).json({ status: 200, data: result });
  } catch (err) {
    next(err);
  }
}


module.exports = {
createPayoutByUser
}