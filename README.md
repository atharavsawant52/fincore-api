# FinCore API

FinCore API is a finance data processing and access control backend built with Node.js, Express, MongoDB, and Mongoose. It is designed for a dashboard-style product where different users can view or manage financial records depending on their assigned role.

## What This Project Covers

This submission is built to match the backend assessment requirements:

- User creation and management
- Role-based access control
- Active and inactive user handling
- Financial record CRUD operations
- Search support
- Soft delete for finance records
- Filtering, sorting, and pagination
- Dashboard summary and aggregate analytics
- Recent activity endpoint
- Weekly and monthly trend analytics
- Input validation and structured error handling
- Persistent storage using MongoDB
- Swagger API documentation
- Automated integration tests
- Seed script and Docker-based local setup

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- Joi for validation
- JWT for authentication
- Cookie-based or Bearer token-based auth support

## Quick Start

```bash
npm install
copy .env.example .env
npm run seed
npm start
```

Important local URLs:

- API base: `http://localhost:5000/api/v1`
- Swagger docs: `http://localhost:5000/api-docs`
- Health check: `http://localhost:5000/health`

## Project Structure

```text
server.js
src/
  app.js
  config/
  constants/
  controllers/
  middlewares/
  models/
  modules/
  routes/
  services/
  utils/
  validators/
postman/
  FinCore-API.postman_collection.json
```

The code is organized by responsibility:

- `routes/` defines the API surface
- `controllers/` handles request and response flow
- `services/` contains business logic
- `models/` defines database schemas
- `validators/` handles request validation
- `middlewares/` handles auth, RBAC, validation, not-found, and error flow

## Role Model

The system uses three roles:

- `VIEWER`: Can read finance records and dashboard summaries, but cannot create, update, or delete records.
- `ANALYST`: Can read finance records, access dashboard summaries, and also create, update, and delete finance records.
- `ADMIN`: Has full access, including user management, role updates, status updates, and cross-user finance access.

## Why `ANALYST` Has Write Access

This is an intentional product decision in this implementation.

The assignment says the role model is flexible and that the exact permissions can be defined by the developer as long as role-based behavior is clear. In this design:

- `VIEWER` is read-only
- `ANALYST` is treated as an operations user who works directly with finance entries
- `ADMIN` manages both users and records across the whole system

This gives a practical separation where not every finance-editing user also needs admin-level user management privileges.

## Access Control Summary

| Action | Viewer | Analyst | Admin |
| --- | --- | --- | --- |
| View own profile | Yes | Yes | Yes |
| Register users | No | No | Yes |
| List users | No | No | Yes |
| Update user role/status | No | No | Yes |
| View finance records | Yes | Yes | Yes |
| Create finance record | No | Yes | Yes |
| Update finance record | No | Yes | Yes |
| Delete finance record | No | Yes | Yes |
| View dashboard summary | Yes | Yes | Yes |
| View or manage other users' finance data | No | No | Yes |

## Authentication Flow

Authentication is handled using JWT.

- `POST /api/v1/auth/bootstrap-admin` creates the first admin user
- `POST /api/v1/auth/login` returns auth context and sets an auth cookie
- Protected routes accept either:
  - the auth cookie
  - `Authorization: Bearer <token>`

## API Overview

Base URL:

```text
http://localhost:5000/api/v1
```

### Health

- `GET /health`

### Auth

- `POST /auth/bootstrap-admin`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Users

- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id/role`
- `PATCH /users/:id/status`

### Finance

- `GET /finance`
- `GET /finance/:id`
- `POST /finance`
- `PATCH /finance/:id`
- `DELETE /finance/:id`

Supported finance filters:

- `type`
- `category`
- `search`
- `startDate`
- `endDate`
- `page`
- `limit`
- `sortBy`
- `sortOrder`
- `userId` for admins
- `includeDeleted` for admins

### Dashboard

- `GET /dashboard/summary`
- `GET /dashboard/recent-activity`

Supported dashboard filters:

- `startDate`
- `endDate`
- `userId` for admins
- `recentLimit` for summary
- `limit` for recent activity

## Dashboard Output

The dashboard summary service returns:

- Total income
- Total expenses
- Net balance
- Category-wise breakdown
- Monthly trends grouped by type
- Weekly trends grouped by type
- Recent activity snapshot

## Validation and Error Handling

The API validates request bodies and query params using Joi.

Examples of handled failures:

- invalid email or password
- missing auth token
- invalid or expired token
- invalid MongoDB object id
- duplicate user email
- invalid record payload
- access denied based on role
- access denied when trying to read or modify another user's records
- inactive user login or request attempts

Error responses follow a consistent shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [
    "\"amount\" must be a positive number"
  ]
}
```

## Data Model

### User

- `name`
- `email`
- `password`
- `role`
- `isActive`
- `lastLoginAt`
- `createdAt`
- `updatedAt`

### FinancialRecord

- `user`
- `type`
- `category`
- `amount`
- `date`
- `notes`
- `createdBy`
- `updatedBy`
- `isDeleted`
- `deletedAt`
- `deletedBy`
- `createdAt`
- `updatedAt`

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root using `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fincore-api
JWT_SECRET=your-very-strong-secret
JWT_EXPIRES_IN=1d
COOKIE_NAME=auth_token
COOKIE_SAME_SITE=strict
COOKIE_SECURE=false
COOKIE_MAX_AGE_MS=86400000
```

### 3. Start MongoDB

Make sure MongoDB is running locally on the URI configured above.

### 4. Run the server

```bash
npm start
```

For development mode:

```bash
npm run dev
```

Run automated tests:

```bash
npm test
```

## API Documentation

Swagger UI is available at:

```text
http://localhost:5000/api-docs
```

## Suggested Manual Test Flow

1. Call `POST /api/v1/auth/bootstrap-admin`
2. Login as admin using `POST /api/v1/auth/login`
3. Create an analyst and a viewer using `POST /api/v1/auth/register`
4. Login as analyst and create finance records
5. Verify finance search with `GET /api/v1/finance?search=salary`
6. Soft delete a record and confirm it no longer appears in default listing
7. Verify viewer can read records but cannot modify them
8. Verify admin can list users and change role or status
9. Call `GET /api/v1/dashboard/summary` to verify aggregates
10. Call `GET /api/v1/dashboard/recent-activity` to verify recent items

## Seed Data

Seed demo users and finance records:

```bash
npm run seed
```

Reset and reseed:

```bash
npm run seed:reset
```

Default seeded credentials:

- `admin@example.com` / `Admin@1234`
- `analyst@example.com` / `Analyst@1234`
- `viewer@example.com` / `Viewer@1234`

## Docker

Run the API and MongoDB together:

```bash
docker compose up --build
```

The API will be available at `http://localhost:5000` and MongoDB at `mongodb://localhost:27017`.

## Postman Collection

A ready-to-use Postman collection is included at:

[`postman/FinCore-API.postman_collection.json`](C:/Users/athar/Desktop/Backend%20Cohort/FinCore%20API/postman/FinCore-API.postman_collection.json)

How to use it:

1. Import the collection into Postman
2. Ensure the `baseUrl` variable is `http://localhost:5000/api/v1`
3. Run `Bootstrap Admin`
4. Run `Login`
5. Copy the returned JWT into the collection `token` variable if you want to use Bearer auth manually
6. Save returned `userId` and `recordId` values into collection variables for user and finance requests

The collection includes requests for:

- health check
- auth flows
- user management
- finance CRUD
- finance search
- dashboard summary
- dashboard recent activity

## Assumptions

- Authentication is simplified to JWT-based auth without refresh tokens.
- There is only one bootstrap admin, enforced by a count check.
- Finance records belong to a single target user.
- Non-admin users are restricted to their own finance data.
- `ANALYST` is intentionally allowed to manage finance records but not users.
- Finance record deletes are implemented as soft delete.

## Tradeoffs

- MongoDB was chosen for simplicity and flexible iteration speed.
- No rate limiting or refresh-token session management is implemented because they were optional for the assignment.

## Known Limitations

- There is no deployment configuration in this submission.
- Category breakdown and trend queries are aggregate outputs and are not cached.
- Swagger spec is maintained manually rather than generated from code.

## Evaluation Mapping

### 1. Backend Design

Clear separation of routes, controllers, services, models, validators, and middleware.

### 2. Logical Thinking

Role restrictions, ownership checks, aggregate summaries, and status enforcement are handled explicitly in backend logic.

### 3. Functionality

The project supports authentication, user management, finance CRUD, filtering, pagination, and dashboard analytics.

### 4. Code Quality

The codebase uses focused modules and centralized validation and error handling.

### 5. Database and Data Modeling

Two main models are used: `User` and `FinancialRecord`, with indexes on frequently queried fields.

### 6. Validation and Reliability

Joi validation, custom errors, duplicate handling, and invalid ID handling are included.

### 7. Documentation

This README, the included Postman collection, and Swagger UI explain setup, usage, assumptions, and system behavior.

### 8. Additional Thoughtfulness

The project includes soft delete, recent activity, weekly trends, a seed script, Docker support, and automated integration tests.

## Future Improvements

- Add role or policy abstraction for more granular permissions
- Add audit history for user and finance changes
- Add refresh tokens and session rotation
- Add rate limiting and request throttling
- Add deployment configuration for a hosted demo
