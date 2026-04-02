const User = require("../models/user.model");
const { ROLES } = require("../constants/roles");
const AppError = require("../utils/appError");
const { signToken } = require("../utils/token");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const createUserAndToken = async ({ name, email, password, role }) => {
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const token = signToken({
    sub: user._id.toString(),
    role: user.role,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
};

const register = async (payload, currentUser) => {
  const existingUser = await User.findOne({ email: payload.email });

  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  let role = ROLES.VIEWER;
  if (payload.role) {
    if (!currentUser || currentUser.role !== ROLES.ADMIN) {
      throw new AppError("Only admins can assign roles during registration", 403);
    }
    role = payload.role;
  }

  return createUserAndToken({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role,
  });
};

const bootstrapAdmin = async (payload) => {
  const adminCount = await User.countDocuments({ role: ROLES.ADMIN });

  if (adminCount > 0) {
    throw new AppError("Bootstrap admin is already initialized", 403);
  }

  const existingUser = await User.findOne({ email: payload.email });

  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  return createUserAndToken({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: ROLES.ADMIN,
  });
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("User account is inactive", 403);
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({
    sub: user._id.toString(),
    role: user.role,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return sanitizeUser(user);
};

module.exports = {
  register,
  bootstrapAdmin,
  login,
  getCurrentUser,
};
