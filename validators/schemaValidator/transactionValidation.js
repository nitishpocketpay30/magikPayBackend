const Joi = require('joi');

const transactionSchema = Joi.object({
  user_id: Joi.number().integer().required()
    .messages({ 'number.base': 'user_id must be an integer' }),

  transactionDate: Joi.date().iso().required()
    .messages({ 'date.base': 'transactionDate must be a valid ISO date' }),

  transactionId: Joi.string().required()
    .messages({ 'string.empty': 'transactionId is required' }),

  orderId: Joi.string().required()
    .messages({ 'string.empty': 'orderId is required' }),

  mode: Joi.string().valid('IMPS', 'NEFT', 'RTGS', 'UPI').required()
    .messages({ 'any.only': 'mode must be one of IMPS, NEFT, RTGS, UPI' }),

  bankDetails: Joi.object().required()
    .messages({ 'object.base': 'bankDetails must be a JSON object' }),

  utrNo: Joi.string().optional().allow(null, ''),

  amount: Joi.number().precision(2).min(0).required()
    .messages({ 'number.base': 'amount must be a non-negative decimal' }),

  charge: Joi.number().precision(2).min(0).required()
    .messages({ 'number.base': 'charge must be a non-negative decimal' }),

  gst: Joi.string().optional().allow(null, ''),

  tds: Joi.number().precision(2).min(0).optional()
    .messages({ 'number.base': 'tds must be a non-negative decimal' }),

  status: Joi.number().integer().valid(0, 1, 2).required()
    .messages({ 'any.only': 'status must be 0, 1, or 2' }),

  apiName: Joi.string().required()
    .messages({ 'string.empty': 'apiName is required' })
});

module.exports = { transactionSchema };
