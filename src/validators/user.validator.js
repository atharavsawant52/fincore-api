const Joi = require("joi");
const { ROLE_VALUES } = require("../constants/roles");

const updateRoleSchema = Joi.object({
  role: Joi.string()
    .valid(...ROLE_VALUES)
    .required(),
});

const updateStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

module.exports = {
  updateRoleSchema,
  updateStatusSchema,
};
