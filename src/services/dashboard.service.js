const FinancialRecord = require("../models/financialRecord.model");
const mongoose = require("mongoose");
const { ROLES } = require("../constants/roles");

const buildDashboardMatch = (query, requester) => {
  const match = {};

  if (requester.role === ROLES.ADMIN && query.includeDeleted) {
    match.isDeleted = true;
  } else {
    match.isDeleted = false;
  }

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
    match.user = new mongoose.Types.ObjectId(query.userId);
  }

  if (requester.role !== ROLES.ADMIN) {
    match.user = requester.id;
  }

  return match;
};

const buildRecentActivityPipeline = (match, limit) => [
  { $match: match },
  { $sort: { date: -1, createdAt: -1 } },
  { $limit: limit },
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
      pipeline: [{ $project: { name: 1, email: 1, role: 1 } }],
    },
  },
  {
    $project: {
      _id: 1,
      type: 1,
      category: 1,
      amount: 1,
      date: 1,
      notes: 1,
      createdAt: 1,
      updatedAt: 1,
      isDeleted: 1,
      user: { $arrayElemAt: ["$user", 0] },
    },
  },
];

const getRecentActivity = async (query, requester) => {
  const match = buildDashboardMatch(query, requester);
  const recentActivity = await FinancialRecord.aggregate(
    buildRecentActivityPipeline(match, query.limit || 5)
  );

  return {
    items: recentActivity,
    count: recentActivity.length,
  };
};

const getSummary = async (query, requester) => {
  const match = buildDashboardMatch(query, requester);

  const [overview, categoryBreakdown, monthlyTrends, weeklyTrends, recentActivity] =
    await Promise.all([
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
    FinancialRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$date" },
            week: { $isoWeek: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          week: "$_id.week",
          type: "$_id.type",
          total: 1,
        },
      },
      { $sort: { year: 1, week: 1, type: 1 } },
    ]),
    FinancialRecord.aggregate(buildRecentActivityPipeline(match, query.recentLimit || 5)),
  ]);

  const totalIncome = overview.find((item) => item._id === "income")?.total || 0;
  const totalExpenses = overview.find((item) => item._id === "expense")?.total || 0;

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    categoryBreakdown,
    monthlyTrends,
    weeklyTrends,
    recentActivity,
  };
};

module.exports = {
  getSummary,
  getRecentActivity,
};
