process.env.NODE_ENV = "test";
process.env.PORT = "5001";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/fincore-test-placeholder";
process.env.JWT_SECRET = "test-secret-key-that-is-long-enough";
process.env.JWT_EXPIRES_IN = "1d";
process.env.COOKIE_NAME = "auth_token";
process.env.COOKIE_SAME_SITE = "strict";
process.env.COOKIE_SECURE = "false";
process.env.COOKIE_MAX_AGE_MS = "86400000";

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const User = require("../src/models/user.model");
const FinancialRecord = require("../src/models/financialRecord.model");

describe("FinCore API", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    await FinancialRecord.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  const bootstrapAdmin = async () => {
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/bootstrap-admin").send({
      name: "Admin User",
      email: "admin@example.com",
      password: "Admin@1234",
      role: "ADMIN",
    });

    return agent;
  };

  const createUserAsAdmin = async (agent, payload) => {
    const response = await agent.post("/api/v1/auth/register").send(payload);
    return response.body.data.user;
  };

  test("bootstraps the first admin and exposes the current user", async () => {
    const agent = await bootstrapAdmin();

    const meResponse = await agent.get("/api/v1/auth/me");

    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.body.data.email).toBe("admin@example.com");
    expect(meResponse.body.data.role).toBe("ADMIN");
  });

  test("prevents a viewer from creating a finance record", async () => {
    const adminAgent = await bootstrapAdmin();
    await createUserAsAdmin(adminAgent, {
      name: "Viewer User",
      email: "viewer@example.com",
      password: "Viewer@1234",
      role: "VIEWER",
    });

    const viewerAgent = request.agent(app);
    await viewerAgent.post("/api/v1/auth/login").send({
      email: "viewer@example.com",
      password: "Viewer@1234",
    });

    const createResponse = await viewerAgent.post("/api/v1/finance").send({
      type: "expense",
      category: "Groceries",
      amount: 800,
      date: "2026-04-02T00:00:00.000Z",
      notes: "Weekly run",
    });

    expect(createResponse.statusCode).toBe(403);
    expect(createResponse.body.message).toMatch(/not authorized/i);
  });

  test("allows an analyst to create, search, and soft delete records", async () => {
    const adminAgent = await bootstrapAdmin();
    await createUserAsAdmin(adminAgent, {
      name: "Analyst User",
      email: "analyst@example.com",
      password: "Analyst@1234",
      role: "ANALYST",
    });

    const analystAgent = request.agent(app);
    await analystAgent.post("/api/v1/auth/login").send({
      email: "analyst@example.com",
      password: "Analyst@1234",
    });

    const createResponse = await analystAgent.post("/api/v1/finance").send({
      type: "income",
      category: "Salary",
      amount: 50000,
      date: "2026-04-01T00:00:00.000Z",
      notes: "April salary credited",
    });

    expect(createResponse.statusCode).toBe(201);
    const recordId = createResponse.body.data._id;

    const searchResponse = await analystAgent.get("/api/v1/finance?search=salary");
    expect(searchResponse.statusCode).toBe(200);
    expect(searchResponse.body.data.items).toHaveLength(1);

    const deleteResponse = await analystAgent.delete(`/api/v1/finance/${recordId}`);
    expect(deleteResponse.statusCode).toBe(200);

    const listAfterDelete = await analystAgent.get("/api/v1/finance");
    expect(listAfterDelete.statusCode).toBe(200);
    expect(listAfterDelete.body.data.items).toHaveLength(0);

    const deletedRecord = await FinancialRecord.findById(recordId);
    expect(deletedRecord.isDeleted).toBe(true);
    expect(deletedRecord.deletedAt).not.toBeNull();
  });

  test("returns dashboard summary with monthly, weekly, and recent activity data", async () => {
    const adminAgent = await bootstrapAdmin();
    const analyst = await createUserAsAdmin(adminAgent, {
      name: "Analyst User",
      email: "analyst@example.com",
      password: "Analyst@1234",
      role: "ANALYST",
    });

    await FinancialRecord.insertMany([
      {
        user: analyst.id,
        createdBy: analyst.id,
        updatedBy: analyst.id,
        type: "income",
        category: "Salary",
        amount: 50000,
        date: new Date("2026-04-01T00:00:00.000Z"),
        notes: "April salary",
      },
      {
        user: analyst.id,
        createdBy: analyst.id,
        updatedBy: analyst.id,
        type: "expense",
        category: "Rent",
        amount: 18000,
        date: new Date("2026-04-03T00:00:00.000Z"),
        notes: "April rent",
      },
    ]);

    const summaryResponse = await adminAgent.get(
      `/api/v1/dashboard/summary?userId=${analyst.id}&recentLimit=2`
    );

    expect(summaryResponse.statusCode).toBe(200);
    expect(summaryResponse.body.data.totalIncome).toBe(50000);
    expect(summaryResponse.body.data.totalExpenses).toBe(18000);
    expect(summaryResponse.body.data.balance).toBe(32000);
    expect(summaryResponse.body.data.monthlyTrends.length).toBeGreaterThan(0);
    expect(summaryResponse.body.data.weeklyTrends.length).toBeGreaterThan(0);
    expect(summaryResponse.body.data.recentActivity).toHaveLength(2);
  });

  test("returns recent activity endpoint data", async () => {
    const adminAgent = await bootstrapAdmin();
    const analyst = await createUserAsAdmin(adminAgent, {
      name: "Analyst User",
      email: "analyst@example.com",
      password: "Analyst@1234",
      role: "ANALYST",
    });

    await FinancialRecord.create({
      user: analyst.id,
      createdBy: analyst.id,
      updatedBy: analyst.id,
      type: "expense",
      category: "Travel",
      amount: 2400,
      date: new Date("2026-04-08T00:00:00.000Z"),
      notes: "Cab and metro",
    });

    const recentResponse = await adminAgent.get(
      `/api/v1/dashboard/recent-activity?userId=${analyst.id}&limit=1`
    );

    expect(recentResponse.statusCode).toBe(200);
    expect(recentResponse.body.data.count).toBe(1);
    expect(recentResponse.body.data.items[0].category).toBe("Travel");
  });
});
