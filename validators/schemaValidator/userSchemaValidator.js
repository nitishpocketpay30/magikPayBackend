const Joi = require('joi');

const userSchemaRegister = Joi.object({
    companyName: Joi.string().min(2).max(100).required(),
    mobileNumber: Joi.string()
        .pattern(/^[0-9+\-() ]{8,20}$/)
        .required()
        .messages({
            'string.pattern.base': 'mobileNumber must be 8–20 digits, and can include + - ( ) spaces'
        }),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    gstNumber: Joi.string().length(15).required(),
});

module.exports = { userSchemaRegister };