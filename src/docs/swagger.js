const swaggerUi = require("swagger-ui-express");

const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "FinCore API",
    version: "1.0.0",
    description: "Finance data processing and access control backend.",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Users" },
    { name: "Finance" },
    { name: "Dashboard" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed" },
          details: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      AuthRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Admin User" },
          email: { type: "string", example: "admin@example.com" },
          password: { type: "string", example: "Admin@1234" },
          role: { type: "string", enum: ["ADMIN", "ANALYST", "VIEWER"] },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "admin@example.com" },
          password: { type: "string", example: "Admin@1234" },
        },
      },
      FinanceRecordRequest: {
        type: "object",
        required: ["type", "category", "amount", "date"],
        properties: {
          userId: { type: "string", example: "680000000000000000000001" },
          type: { type: "string", enum: ["income", "expense"] },
          category: { type: "string", example: "Salary" },
          amount: { type: "number", example: 50000 },
          date: { type: "string", format: "date-time" },
          notes: { type: "string", example: "April salary" },
        },
      },
      UserRoleUpdateRequest: {
        type: "object",
        required: ["role"],
        properties: {
          role: { type: "string", enum: ["ADMIN", "ANALYST", "VIEWER"] },
        },
      },
      UserStatusUpdateRequest: {
        type: "object",
        required: ["isActive"],
        properties: {
          isActive: { type: "boolean", example: false },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "Server is healthy",
          },
        },
      },
    },
    "/api/v1/auth/bootstrap-admin": {
      post: {
        tags: ["Auth"],
        summary: "Create the first admin user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRequest" },
            },
          },
        },
        responses: {
          201: { description: "Bootstrap admin created successfully" },
          409: { description: "User already exists" },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive auth context",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: { description: "Login successful" },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a user as admin",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRequest" },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully" },
          403: { description: "Admin only" },
        },
      },
    },
    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "List users",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Users fetched successfully" },
          403: { description: "Admin only" },
        },
      },
    },
    "/api/v1/users/{id}/role": {
      patch: {
        tags: ["Users"],
        summary: "Update user role",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserRoleUpdateRequest" },
            },
          },
        },
        responses: {
          200: { description: "User role updated successfully" },
        },
      },
    },
    "/api/v1/users/{id}/status": {
      patch: {
        tags: ["Users"],
        summary: "Update user status",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserStatusUpdateRequest" },
            },
          },
        },
        responses: {
          200: { description: "User status updated successfully" },
        },
      },
    },
    "/api/v1/finance": {
      get: {
        tags: ["Finance"],
        summary: "List finance records with filters",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "type", schema: { type: "string" } },
          { in: "query", name: "category", schema: { type: "string" } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "startDate", schema: { type: "string", format: "date-time" } },
          { in: "query", name: "endDate", schema: { type: "string", format: "date-time" } },
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "sortBy", schema: { type: "string" } },
          { in: "query", name: "sortOrder", schema: { type: "string" } },
          { in: "query", name: "includeDeleted", schema: { type: "boolean" } },
        ],
        responses: {
          200: { description: "Financial records fetched successfully" },
        },
      },
      post: {
        tags: ["Finance"],
        summary: "Create finance record",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FinanceRecordRequest" },
            },
          },
        },
        responses: {
          201: { description: "Financial record created successfully" },
        },
      },
    },
    "/api/v1/finance/{id}": {
      get: {
        tags: ["Finance"],
        summary: "Get finance record by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Financial record fetched successfully" },
        },
      },
      patch: {
        tags: ["Finance"],
        summary: "Update finance record",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FinanceRecordRequest" },
            },
          },
        },
        responses: {
          200: { description: "Financial record updated successfully" },
        },
      },
      delete: {
        tags: ["Finance"],
        summary: "Soft delete finance record",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Financial record deleted successfully" },
        },
      },
    },
    "/api/v1/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Get finance dashboard summary",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "startDate", schema: { type: "string", format: "date-time" } },
          { in: "query", name: "endDate", schema: { type: "string", format: "date-time" } },
          { in: "query", name: "recentLimit", schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Dashboard summary fetched successfully" },
        },
      },
    },
    "/api/v1/dashboard/recent-activity": {
      get: {
        tags: ["Dashboard"],
        summary: "Get recent finance activity",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "query", name: "limit", schema: { type: "integer" } }],
        responses: {
          200: { description: "Dashboard recent activity fetched successfully" },
        },
      },
    },
  },
};

module.exports = {
  swaggerServe: swaggerUi.serve,
  swaggerSetup: swaggerUi.setup(swaggerDocument, {
    explorer: true,
  }),
};
