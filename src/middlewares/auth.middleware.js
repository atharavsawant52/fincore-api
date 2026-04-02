const User = require("../models/user.model");
const config = require("../config/env");
const AppError = require("../utils/appError");
const { verifyToken } = require("../utils/token");

const getTokenFromAuthorizationHeader = (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.split(" ")[1];
};

const authenticate = async (req, _res, next) => {
  const token =
    req.cookies?.[config.cookieName] ||
    getTokenFromAuthorizationHeader(req.headers.authorization);

  if (!token) {
    return next(new AppError("Authentication token is missing", 401));
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }

  const user = await User.findById(decoded.sub).select("_id name email role isActive");

  if (!user) {
    return next(new AppError("User associated with this token no longer exists", 401));
  }

  if (!user.isActive) {
    return next(new AppError("User account is inactive", 403));
  }

  req.user = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };

  return next();
};

module.exports = authenticate;
