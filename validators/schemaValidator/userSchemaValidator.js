const Joi = require('joi');


const userSchema = Joi.object({
  companyName: Joi.string().min(1).required()
    .messages({ 'any.required': 'companyName is required' }),

  mobileNumber: Joi.string()
    .pattern(/^(?:\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})$/)
    .required()
    .messages({
      'string.pattern.base':
        'mobileNumber must be a 10‑digit number (e.g. 1234567890 or 123-456-7890)'
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.email': 'Email must be a valid email',
      'string.empty': 'Email is required'
    }),

  panCardUpload: Joi.string().optional().allow(null, ''),
  aadhaarCardUpload: Joi.string().optional().allow(null, ''),

  gstNumber: Joi.string().length(15).optional()
    .messages({ 'string.length': 'gstNumber must be 15 characters' }),

  panNumber: Joi.string().length(10).optional().allow(null, '')
    .messages({ 'string.length': 'panNumber must be 10 characters' }),

  panHolderName: Joi.string().optional().allow(null, ''),

  gstDocumentUpload: Joi.string().optional().allow(null, ''),
  contactPersonName: Joi.string().optional().allow(null, ''),

  otp: Joi.number().integer().min(0).max(999999).optional().allow(null),
  
  minAmount: Joi.number().precision(2).min(0).optional().allow(null),
  maxAmount: Joi.number().precision(2).min(0).optional().allow(null),

  userIp1: Joi.string().ip({ version: ['ipv4'] }).optional().allow(null, ''),
  user_ip2: Joi.string().optional().allow(null, ''),
  user_ip3: Joi.string().optional().allow(null, ''),

  access_token: Joi.string().optional().allow(null, ''),

  topup: Joi.number().integer().min(0).optional()
    .messages({ 'any.required': 'topup is required' }),

  contactPersonMobile: Joi.string().pattern(/^(?:\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})$/).optional().allow(null, '')
    .messages({ 'string.pattern.base': 'contactPersonMobile must be valid' })
});


const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(8).max(128).required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password cannot exceed 128 characters'
    })
});

module.exports = { userSchema,loginSchema };