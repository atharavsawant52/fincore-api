const dashboardService = require("../services/dashboard.service");
const { sendSuccess } = require("../utils/apiResponse");

const getSummary = async (req, res) => {
  const data = await dashboardService.getSummary(req.query, req.user);
  return sendSuccess(res, 200, "Dashboard summary fetched successfully", data);
};

module.exports = {
  getSummary,
};
