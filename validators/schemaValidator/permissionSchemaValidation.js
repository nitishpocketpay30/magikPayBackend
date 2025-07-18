const Joi = require('joi');

const accessModuleSchema = Joi.object({
  moduleName: Joi.string().trim().required(),
  module_id: Joi.number().integer().required(),
  submoduleName: Joi.string().trim().required(),
  sub_module_id: Joi.number().integer().required(),
  permissions: Joi.object({
    create: Joi.boolean().default(false),
    read: Joi.boolean().default(false),
    update: Joi.boolean().default(false),
    delete: Joi.boolean().default(false),
  })
    .required()
    .unknown(false), // disallow extra keys
   userType: Joi.number().integer().required(),
  userId: Joi.number().integer().required()
});
const removeAllUserPermissionsSchema = Joi.object({
  userId: Joi.number().integer().required(),
  userType: Joi.number().integer().required(),
  module_id: Joi.number().integer().required(),
  sub_module_id: Joi.number().integer().optional()
});

module.exports = { accessModuleSchema,removeAllUserPermissionsSchema };