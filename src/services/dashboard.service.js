const FinancialRecord = require("../models/financialRecord.model");
const { ROLES } = require("../constants/roles");

const buildDashboardMatch = (query, requester) => {
  const match = {};

  if (query.startDate || query.endDate) {
    match.date = {};
    if (query.startDate) {
      match.date.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      match.date.$lte = new Date(query.endDate);
    }
  }

  if (requester.role === ROLES.ADMIN && query.userId) {
    match.user = query.userId;
  }

  if (requester.role !== ROLES.ADMIN) {
    match.user = requester.id;
  }

  return match;
};

const getSummary = async (query, requester) => {
  const match = buildDashboardMatch(query, requester);

  const [overview, categoryBreakdown, trends] = await Promise.all([
    FinancialRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]),
    FinancialRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            type: "$type",
            category: "$category",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id.type",
          category: "$_id.category",
          total: 1,
        },
      },
      { $sort: { type: 1, total: -1 } },
    ]),
    FinancialRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          type: "$_id.type",
          total: 1,
        },
      },
      { $sort: { year: 1, month: 1, type: 1 } },
    ]),
  ]);

  const totalIncome = overview.find((item) => item._id === "income")?.total || 0;
  const totalExpenses = overview.find((item) => item._id === "expense")?.total || 0;

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    categoryBreakdown,
    trends,
  };
};

module.exports = {
  getSummary,
};
