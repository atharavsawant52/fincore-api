const userService = require("../services/user.service");
const { sendSuccess } = require("../utils/apiResponse");

const listUsers = async (_req, res) => {
  const data = await userService.listUsers();
  return sendSuccess(res, 200, "Users fetched successfully", data);
};

const getUserById = async (req, res) => {
  const data = await userService.getUserById(req.params.id);
  return sendSuccess(res, 200, "User fetched successfully", data);
};

const updateUserRole = async (req, res) => {
  const data = await userService.updateUserRole(req.params.id, req.body.role);
  return sendSuccess(res, 200, "User role updated successfully", data);
};

const updateUserStatus = async (req, res) => {
  const data = await userService.updateUserStatus(req.params.id, req.body.isActive);
  return sendSuccess(res, 200, "User status updated successfully", data);
};

module.exports = {
  listUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
};
