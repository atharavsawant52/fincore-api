const Joi = require("joi");
const { RECORD_TYPE_VALUES } = require("../constants/record-types");

const createFinancialRecordSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
  type: Joi.string()
    .valid(...RECORD_TYPE_VALUES)
    .required(),
  category: Joi.string().trim().min(2).max(100).required(),
  amount: Joi.number().positive().precision(2).required(),
  date: Joi.date().iso().required(),
  notes: Joi.string().trim().allow("").max(500).optional(),
});

const updateFinancialRecordSchema = Joi.object({
  type: Joi.string()
    .valid(...RECORD_TYPE_VALUES)
    .optional(),
  category: Joi.string().trim().min(2).max(100).optional(),
  amount: Joi.number().positive().precision(2).optional(),
  date: Joi.date().iso().optional(),
  notes: Joi.string().trim().allow("").max(500).optional(),
}).min(1);

const financialQuerySchema = Joi.object({
  type: Joi.string()
    .valid(...RECORD_TYPE_VALUES)
    .optional(),
  category: Joi.string().trim().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid("date", "amount", "createdAt").default("date"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  userId: Joi.string().hex().length(24).optional(),
});

module.exports = {
  createFinancialRecordSchema,
  updateFinancialRecordSchema,
  financialQuerySchema,
};
