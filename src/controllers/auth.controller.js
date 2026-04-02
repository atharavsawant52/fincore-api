const authService = require("../services/auth.service");
const { sendSuccess } = require("../utils/apiResponse");
const { clearAuthCookie, setAuthCookie } = require("../utils/authCookie");

const register = async (req, res) => {
  const { token, ...data } = await authService.register(req.body, req.user);

  if (!req.user && token) {
    setAuthCookie(res, token);
  }

  return sendSuccess(res, 201, "User registered successfully", data);
};

const bootstrapAdmin = async (req, res) => {
  const { token, ...data } = await authService.bootstrapAdmin(req.body);
  setAuthCookie(res, token);
  return sendSuccess(res, 201, "Bootstrap admin created successfully", data);
};

const login = async (req, res) => {
  const { token, ...data } = await authService.login(req.body);
  setAuthCookie(res, token);
  return sendSuccess(res, 200, "Login successful", data);
};

const logout = async (_req, res) => {
  clearAuthCookie(res);
  return sendSuccess(res, 200, "Logout successful");
};

const me = async (req, res) => {
  const data = await authService.getCurrentUser(req.user.id);
  return sendSuccess(res, 200, "Current user fetched successfully", data);
};

module.exports = {
  register,
  bootstrapAdmin,
  login,
  logout,
  me,
};
