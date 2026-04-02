const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/rbac.middleware");
const validate = require("../middlewares/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { ROLES } = require("../constants/roles");
const { dashboardQuerySchema } = require("../validators/dashboard.validator");

const router = express.Router();

router.get(
  "/summary",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER),
  validate(dashboardQuerySchema, "query"),
  asyncHandler(dashboardController.getSummary)
);

module.exports = router;
