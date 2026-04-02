const Joi = require("joi");

const dashboardQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  userId: Joi.string().hex().length(24).optional(),
});

module.exports = {
  dashboardQuerySchema,
};
