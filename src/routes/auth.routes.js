const express = require("express");
const authController = require("../controllers/auth.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/rbac.middleware");
const validate = require("../middlewares/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { ROLES } = require("../constants/roles");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

const router = express.Router();

router.post(
  "/register",
  authenticate,
  authorize(ROLES.ADMIN),
  validate(registerSchema),
  asyncHandler(authController.register)
);
router.post(
  "/bootstrap-admin",
  validate(registerSchema),
  asyncHandler(authController.bootstrapAdmin)
);
router.post("/login", validate(loginSchema), asyncHandler(authController.login));
router.post("/logout", authController.logout);
router.get("/me", authenticate, asyncHandler(authController.me));

module.exports = router;
