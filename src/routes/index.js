const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const financeRoutes = require("./finance.routes");
const dashboardRoutes = require("./dashboard.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/finance", financeRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
