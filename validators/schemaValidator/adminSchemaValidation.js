const Joi = require('joi');

const adminSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required()
    .messages({
      'string.base': 'firstName must be a string',
      'string.empty': 'firstName is required',
      'string.min': 'firstName must be at least 2 characters',
      'string.max': 'firstName must be at most 50 characters'
    }),

  lastName: Joi.string().min(2).max(50).required()
    .messages({
      'string.base': 'lastName must be a string',
      'string.empty': 'lastName is required',
      'string.min': 'lastName must be at least 2 characters',
      'string.max': 'lastName must be at most 50 characters'
    }),

  email: Joi.string().email().required()
    .messages({
      'string.email': 'Invalid email format',
      'any.required': 'email is required'
    }),

  passwordHash: Joi.string().length(60).required()
    .messages({
      'string.length': 'passwordHash must be exactly 60 characters',
      'any.required': 'passwordHash is required'
    }),

  status: Joi.boolean().required()
    .messages({ 'boolean.base': 'status must be true or false' }),

  role: Joi.number().integer().required()
    .messages({ 'number.base': 'role must be an integer' }),

  ip: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).required()
    .messages({ 'string.ip': 'ip must be a valid IPv4 or IPv6 address' })
});

module.exports = { adminSchema };
