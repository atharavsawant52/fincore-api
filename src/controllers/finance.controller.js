const financeService = require("../services/finance.service");
const { sendSuccess } = require("../utils/apiResponse");

const createRecord = async (req, res) => {
  const data = await financeService.createRecord(req.body, req.user);
  return sendSuccess(res, 201, "Financial record created successfully", data);
};

const listRecords = async (req, res) => {
  const data = await financeService.listRecords(req.query, req.user);
  return sendSuccess(res, 200, "Financial records fetched successfully", data);
};

const getRecordById = async (req, res) => {
  const data = await financeService.getRecordById(req.params.id, req.user);
  return sendSuccess(res, 200, "Financial record fetched successfully", data);
};

const updateRecord = async (req, res) => {
  const data = await financeService.updateRecord(req.params.id, req.body, req.user);
  return sendSuccess(res, 200, "Financial record updated successfully", data);
};

const deleteRecord = async (req, res) => {
  await financeService.deleteRecord(req.params.id, req.user);
  return sendSuccess(res, 200, "Financial record deleted successfully");
};

module.exports = {
  createRecord,
  listRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
