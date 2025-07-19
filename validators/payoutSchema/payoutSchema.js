const Joi = require('joi');

const PayoutSchema = Joi.object({
  mode: Joi.string().valid('IMPS', 'NEFT').required(),
  beneficiaryname: Joi.string().min(2).max(100).required(),
  account: Joi.string().pattern(/^\d{9,18}$/).required().label('Account Number'),
  transfer_bank_name: Joi.string().min(2).max(100).required(),
  ifsc: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required().label('IFSC Code'),
  mobile: Joi.string().pattern(/^\d{10}$/).required().label('Mobile Number'),
  transaction_amount: Joi.number().positive().min(1).required().label('Transaction Amount'),
  providerKey: Joi.string().valid('RECHARGEKIT_PAY','UNPAY_MAGIKPAY','AERON_PAY').required(),
  email: Joi.when('providerKey', {
    is: 'AERONPAY',
    then: Joi.string().email().required(),
    otherwise: Joi.string().optional()
  }),
    address: Joi.when('providerKey', {
    is: 'AERONPAY',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  })
});
const publicPayoutSchema = Joi.object({
  access_token: Joi.string()
    .alphanum()
    .length(32)
    .required()
    .label('Access Token'),

  beneAccNum: Joi.string()
    .pattern(/^\d{9,20}$/)
    .required()
    .label('Beneficiary Account Number'),

  beneIfscCode: Joi.string()
    .length(11)
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .required()
    .label('IFSC Code'),

  beneName: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .label('Beneficiary Name'),

  txnPaymode: Joi.string()
    .valid('IMPS', 'NEFT', 'RTGS')
    .required()
    .label('Transfer Mode'),

  txnAmount: Joi.number()
    .greater(0)
    .required()
    .label('Transaction Amount'),

  orderid: Joi.string()
    .alphanum()
    .min(6)
    .max(30)
    .required()
    .label('Order ID'),
});
module.exports={
    PayoutSchema,
    publicPayoutSchema
}