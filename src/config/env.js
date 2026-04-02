const dotenv = require("dotenv");
const Joi = require("joi");

dotenv.config();

const schema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "production")
    .default("development"),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default("1d"),
  COOKIE_NAME: Joi.string().default("auth_token"),
  COOKIE_SAME_SITE: Joi.string()
    .valid("strict", "lax", "none")
    .default("strict"),
  COOKIE_SECURE: Joi.boolean().optional(),
  COOKIE_MAX_AGE_MS: Joi.number().integer().positive().default(24 * 60 * 60 * 1000),
  CORS_ORIGIN: Joi.string().optional(),
}).unknown();

const { error, value } = schema.validate(process.env, {
  abortEarly: false,
});

if (error) {
  throw new Error(`Environment validation failed: ${error.message}`);
}

const cookieSecure =
  value.NODE_ENV === "production"
    ? true
    : typeof value.COOKIE_SECURE === "boolean"
      ? value.COOKIE_SECURE
      : false;

module.exports = {
  env: value.NODE_ENV,
  port: value.PORT,
  mongoUri: value.MONGODB_URI,
  jwtSecret: value.JWT_SECRET,
  jwtExpiresIn: value.JWT_EXPIRES_IN,
  cookieName: value.COOKIE_NAME,
  cookieSameSite: value.COOKIE_SAME_SITE,
  cookieSecure,
  cookieMaxAgeMs: value.COOKIE_MAX_AGE_MS,
  corsOrigin: value.CORS_ORIGIN,
};
