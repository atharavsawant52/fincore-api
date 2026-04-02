const express = require("express");
const userController = require("../controllers/user.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/rbac.middleware");
const validate = require("../middlewares/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { ROLES } = require("../constants/roles");
const { updateRoleSchema, updateStatusSchema } = require("../validators/user.validator");

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get("/", asyncHandler(userController.listUsers));
router.get("/:id", asyncHandler(userController.getUserById));
router.patch("/:id/role", validate(updateRoleSchema), asyncHandler(userController.updateUserRole));
router.patch("/:id/status", validate(updateStatusSchema), asyncHandler(userController.updateUserStatus));

module.exports = router;
