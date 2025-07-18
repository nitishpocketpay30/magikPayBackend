const Joi = require("joi");

const addProviderSchema = Joi.object({
    provider: Joi.string().trim().required(),
    access_key: Joi.string().trim().required(),
     status: Joi.number()
    .optional()
});
const assignProviderSchema = Joi.object({
    providerId: Joi.number().required(),
    userId: Joi.number().required()
});
module.exports = { addProviderSchema,assignProviderSchema };