const FinancialRecord = require("../models/financialRecord.model");
const { ROLES } = require("../constants/roles");
const AppError = require("../utils/appError");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFinanceFilter = (query, requester) => {
  const filter = {};

  if (requester.role === ROLES.ADMIN && query.includeDeleted) {
    filter.isDeleted = true;
  } else {
    filter.isDeleted = false;
  }

  if (query.type) {
    filter.type = query.type;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.search) {
    const searchRegex = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [{ category: searchRegex }, { notes: searchRegex }];
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) {
      filter.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filter.date.$lte = new Date(query.endDate);
    }
  }

  if (requester.role === ROLES.ADMIN) {
    if (query.userId) {
      filter.user = query.userId;
    }
  } else {
    filter.user = requester.id;
  }

  return filter;
};

const assertRecordAccess = (record, requester) => {
  if (!record) {
    throw new AppError("Financial record not found", 404);
  }

  if (requester.role !== ROLES.ADMIN && record.user.toString() !== requester.id) {
    throw new AppError("You are not allowed to access this financial record", 403);
  }
};

const createRecord = async (payload, requester) => {
  const ownerId = requester.role === ROLES.ADMIN && payload.userId ? payload.userId : requester.id;

  const record = await FinancialRecord.create({
    user: ownerId,
    type: payload.type,
    category: payload.category,
    amount: payload.amount,
    date: payload.date,
    notes: payload.notes || "",
    createdBy: requester.id,
  });

  return record;
};

const listRecords = async (query, requester) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;
  const filter = buildFinanceFilter(query, requester);
  const sortDirection = query.sortOrder === "asc" ? 1 : -1;
  const sort = { [query.sortBy || "date"]: sortDirection };

  const [items, total] = await Promise.all([
    FinancialRecord.find(filter)
      .populate("user", "name email role")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    FinancialRecord.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getRecordById = async (recordId, requester) => {
  const record = await FinancialRecord.findOne({ _id: recordId, isDeleted: false }).populate(
    "user",
    "name email role"
  );
  assertRecordAccess(record, requester);
  return record;
};

const updateRecord = async (recordId, payload, requester) => {
  const record = await FinancialRecord.findOne({ _id: recordId, isDeleted: false });
  assertRecordAccess(record, requester);

  Object.assign(record, payload, {
    updatedBy: requester.id,
  });

  await record.save();
  return record;
};

const deleteRecord = async (recordId, requester) => {
  const record = await FinancialRecord.findOne({ _id: recordId, isDeleted: false });
  assertRecordAccess(record, requester);

  record.isDeleted = true;
  record.deletedAt = new Date();
  record.deletedBy = requester.id;
  record.updatedBy = requester.id;
  await record.save();
};

module.exports = {
  createRecord,
  listRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
