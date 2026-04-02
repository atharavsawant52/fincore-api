const config = require("../config/env");

const getAuthCookieOptions = () => ({
  httpOnly: true,
  sameSite: config.cookieSameSite,
  secure: config.cookieSecure,
  maxAge: config.cookieMaxAgeMs,
  path: "/",
});

const getClearAuthCookieOptions = () => ({
  httpOnly: true,
  sameSite: config.cookieSameSite,
  secure: config.cookieSecure,
  path: "/",
});

const setAuthCookie = (res, token) =>
  res.cookie(config.cookieName, token, getAuthCookieOptions());

const clearAuthCookie = (res) =>
  res.clearCookie(config.cookieName, getClearAuthCookieOptions());

module.exports = {
  setAuthCookie,
  clearAuthCookie,
  getAuthCookieOptions,
  getClearAuthCookieOptions,
};
