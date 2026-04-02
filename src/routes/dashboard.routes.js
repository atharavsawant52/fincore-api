const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/rbac.middleware");
const validate = require("../middlewares/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { ROLES } = require("../constants/roles");
const {
  dashboardQuerySchema,
  recentActivityQuerySchema,
} = require("../validators/dashboard.validator");

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER));

router.get(
  "/summary",
  validate(dashboardQuerySchema, "query"),
  asyncHandler(dashboardController.getSummary)
);

router.get(
  "/recent-activity",
  validate(recentActivityQuerySchema, "query"),
  asyncHandler(dashboardController.getRecentActivity)
);

module.exports = router;
