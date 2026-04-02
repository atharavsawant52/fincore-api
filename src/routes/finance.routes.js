const express = require("express");
const financeController = require("../controllers/finance.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/rbac.middleware");
const validate = require("../middlewares/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");
const { ROLES } = require("../constants/roles");
const {
  createFinancialRecordSchema,
  updateFinancialRecordSchema,
  financialQuerySchema,
} = require("../validators/finance.validator");

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER),
  validate(financialQuerySchema, "query"),
  asyncHandler(financeController.listRecords)
);

router.get(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER),
  asyncHandler(financeController.getRecordById)
);

router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.ANALYST),
  validate(createFinancialRecordSchema),
  asyncHandler(financeController.createRecord)
);

router.patch(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.ANALYST),
  validate(updateFinancialRecordSchema),
  asyncHandler(financeController.updateRecord)
);

router.delete(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.ANALYST),
  asyncHandler(financeController.deleteRecord)
);

module.exports = router;
