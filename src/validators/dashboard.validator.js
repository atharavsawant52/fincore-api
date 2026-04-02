const Joi = require("joi");

const dashboardQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  userId: Joi.string().hex().length(24).optional(),
  includeDeleted: Joi.boolean().default(false),
  recentLimit: Joi.number().integer().min(1).max(20).default(5),
});

const recentActivityQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  userId: Joi.string().hex().length(24).optional(),
  includeDeleted: Joi.boolean().default(false),
  limit: Joi.number().integer().min(1).max(20).default(5),
});

module.exports = {
  dashboardQuerySchema,
  recentActivityQuerySchema,
};
