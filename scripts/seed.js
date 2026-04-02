process.env.NODE_ENV = process.env.NODE_ENV || "development";

const connectDB = require("../src/config/db");
const config = require("../src/config/env");
const User = require("../src/models/user.model");
const FinancialRecord = require("../src/models/financialRecord.model");
const { ROLES } = require("../src/constants/roles");

const demoUsers = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "Admin@1234",
    role: ROLES.ADMIN,
  },
  {
    name: "Analyst User",
    email: "analyst@example.com",
    password: "Analyst@1234",
    role: ROLES.ANALYST,
  },
  {
    name: "Viewer User",
    email: "viewer@example.com",
    password: "Viewer@1234",
    role: ROLES.VIEWER,
  },
];

const buildDemoRecords = (usersByEmail) => [
  {
    user: usersByEmail["analyst@example.com"]._id,
    createdBy: usersByEmail["admin@example.com"]._id,
    updatedBy: usersByEmail["admin@example.com"]._id,
    type: "income",
    category: "Salary",
    amount: 50000,
    date: new Date("2026-04-01T00:00:00.000Z"),
    notes: "April salary",
  },
  {
    user: usersByEmail["analyst@example.com"]._id,
    createdBy: usersByEmail["analyst@example.com"]._id,
    updatedBy: usersByEmail["analyst@example.com"]._id,
    type: "expense",
    category: "Rent",
    amount: 18000,
    date: new Date("2026-04-03T00:00:00.000Z"),
    notes: "Monthly house rent",
  },
  {
    user: usersByEmail["viewer@example.com"]._id,
    createdBy: usersByEmail["admin@example.com"]._id,
    updatedBy: usersByEmail["admin@example.com"]._id,
    type: "expense",
    category: "Groceries",
    amount: 4200,
    date: new Date("2026-04-05T00:00:00.000Z"),
    notes: "Weekend shopping",
  },
];

const run = async () => {
  const shouldReset = process.argv.includes("--reset");

  try {
    await connectDB(config.mongoUri);

    if (shouldReset) {
      await FinancialRecord.deleteMany({});
      await User.deleteMany({});
    }

    const usersByEmail = {};

    for (const userPayload of demoUsers) {
      let user = await User.findOne({ email: userPayload.email });

      if (!user) {
        user = await User.create(userPayload);
      }

      usersByEmail[user.email] = user;
    }

    const existingRecordCount = await FinancialRecord.countDocuments();
    if (existingRecordCount === 0) {
      await FinancialRecord.insertMany(buildDemoRecords(usersByEmail));
    }

    console.log("Seed completed successfully.");
    console.log("Admin:", demoUsers[0].email, demoUsers[0].password);
    console.log("Analyst:", demoUsers[1].email, demoUsers[1].password);
    console.log("Viewer:", demoUsers[2].email, demoUsers[2].password);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

run();
