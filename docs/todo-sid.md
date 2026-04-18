# 🔧 Sid — Foundation, Auth, Infrastructure & Shared Core

> **Role:** Project Architect & Infrastructure Lead
> **Owns:** Root configs, `packages/shared-types/`, `apps/backend/` scaffold, `shared/` infra, auth module, users module, dashboard module, DB schema, scripts, seed data

---

## 🔴 CRITICAL — You Push FIRST. Everyone Else Is Blocked Until You Do.

You own the monorepo skeleton, the DB schema, the shared-types, and the auth middleware.
**Dev, Het, and Avani cannot start writing any code until your Sprint 0 push lands.**

---

## Files You Own (ONLY you touch these)

```
# Root
package.json                     ← Root workspace config (npm workspaces)
.gitignore
README.md
tsconfig.base.json               ← (if shared TS config)

# Scripts
scripts/start.sh
scripts/start.bat
scripts/backend.sh
scripts/backend.bat

# Shared Types (ALL files)
packages/shared-types/package.json
packages/shared-types/tsconfig.json
packages/shared-types/src/user.ts
packages/shared-types/src/approval.ts
packages/shared-types/src/issue.ts
packages/shared-types/src/copilot.ts
packages/shared-types/src/notice.ts
packages/shared-types/src/calendar.ts
packages/shared-types/src/finance.ts
packages/shared-types/src/karma.ts
packages/shared-types/src/plugin.ts
packages/shared-types/src/analytics.ts
packages/shared-types/src/index.ts           ← barrel export

# Backend Scaffold (entry points)
apps/backend/package.json
apps/backend/tsconfig.json
apps/backend/.env.example
apps/backend/src/app.ts                       ← Express app setup (route registration)
apps/backend/src/server.ts                    ← Entry point

# Backend Shared Infrastructure (ALL files)
apps/backend/src/shared/db/neon.client.ts
apps/backend/src/shared/db/schema.ts          ← Drizzle schema (ALL tables)
apps/backend/src/shared/db/seed.ts            ← Demo seed data script
apps/backend/src/shared/db/migrations/
apps/backend/src/shared/websocket/ws.server.ts
apps/backend/src/shared/websocket/ws.rooms.ts
apps/backend/src/shared/storage/cloudinary.service.ts
apps/backend/src/shared/notifications/fcm.service.ts
apps/backend/src/shared/email/resend.service.ts
apps/backend/src/shared/middleware/auth.middleware.ts
apps/backend/src/shared/middleware/rate-limit.middleware.ts
apps/backend/src/shared/middleware/error.middleware.ts
apps/backend/src/shared/middleware/logger.middleware.ts

# Backend Modules — ONLY auth, users, dashboard
apps/backend/src/modules/auth/*
apps/backend/src/modules/users/*
apps/backend/src/modules/dashboard/*
```

---

## Sprint 0 — Scaffold & Foundation (HIGHEST PRIORITY)

> ✅ **PUSH CHECKPOINT S0**: All scaffold work complete and verified.

- [x] Create root `package.json` with npm workspaces: `["packages/*", "apps/*"]`
- [x] Create `.gitignore` (node_modules, .env, dist, .expo, etc.)
- [x] Create `README.md` with project overview
- [x] Scaffold `packages/shared-types/`:
  - [x] `package.json` with `"name": "@aether/shared-types"`
  - [x] `tsconfig.json`
  - [x] ALL TypeScript interfaces in `src/`:
    - `user.ts` — User, UserRole, AuthResponse
    - `approval.ts` — WorkflowRequest, ApprovalStage, WorkflowType
    - `issue.ts` — Issue, IssueCategory, IssuePriority, HeatmapPoint
    - `copilot.ts` — CopilotMessage, CopilotSession, ProactiveAlert
    - `notice.ts` — Notice
    - `calendar.ts` — CalendarEvent, ClashResult, SlotSuggestion
    - `finance.ts` — FinanceDue, PaymentOrder, PaymentVerification
    - `karma.ts` — KarmaEvent, KarmaScore
    - `plugin.ts` — Plugin, PluginSubmission, SecurityClearanceCertificate
    - `analytics.ts` — AnalyticsSummary, ApprovalBottleneck, IssueStat
    - `index.ts` — barrel export of all above
- [x] Scaffold `apps/backend/`:
  - [x] `package.json` with all dependencies (express, drizzle-orm, socket.io, zod, multer, node-cron, axios, cors, dotenv, etc.)
  - [x] `tsconfig.json` (strict mode)
  - [x] `.env.example` with ALL env var placeholders
  - [x] `src/server.ts` — entry point, starts Express + Socket.IO
  - [x] `src/app.ts` — Express app setup with CORS, body-parser, error middleware, and **ALL route imports pre-wired** (even if modules are empty stubs):
    ```typescript
    // Pre-wire all routes so Dev/Het don't need to edit this file
    app.use('/api/auth', authRoutes);
    app.use('/api/users', authMiddleware, usersRoutes);
    app.use('/api/dashboard', authMiddleware, dashboardRoutes);
    app.use('/api/workflow', authMiddleware, workflowRoutes);
    app.use('/api/notices', authMiddleware, noticesRoutes);
    app.use('/api/copilot', authMiddleware, copilotRoutes);
    app.use('/api/attendance', authMiddleware, attendanceRoutes);
    app.use('/api/issues', authMiddleware, issuesRoutes);
    app.use('/api/calendar', authMiddleware, calendarRoutes);
    app.use('/api/pyq', authMiddleware, pyqRoutes);
    app.use('/api/finance', authMiddleware, financeRoutes);
    app.use('/api/analytics', authMiddleware, analyticsRoutes);
    app.use('/api/karma', authMiddleware, karmaRoutes);
    app.use('/api/plugins', authMiddleware, pluginsRoutes);
    ```
- [x] Create **EMPTY STUB route files** for ALL modules (so `app.ts` compiles):
  - Each stub is just: `const router = Router(); export default router;`
  - Create these stubs in EVERY module directory:
    - `apps/backend/src/modules/workflow/workflow.routes.ts`
    - `apps/backend/src/modules/copilot/copilot.routes.ts`
    - `apps/backend/src/modules/notices/notices.routes.ts`
    - `apps/backend/src/modules/attendance/attendance.routes.ts`
    - `apps/backend/src/modules/issues/issues.routes.ts`
    - `apps/backend/src/modules/calendar/calendar.routes.ts`
    - `apps/backend/src/modules/pyq/pyq.routes.ts`
    - `apps/backend/src/modules/finance/finance.routes.ts`
    - `apps/backend/src/modules/analytics/analytics.routes.ts`
    - `apps/backend/src/modules/karma/karma.routes.ts`
    - `apps/backend/src/modules/plugins/plugins.routes.ts`
  - ‼️ **IMPORTANT:** ONLY create the `.routes.ts` stub file in each module. Do NOT create controller/service files — those belong to Dev or Het.
- [x] Implement all `shared/` infrastructure:
  - [x] `shared/db/neon.client.ts` — Drizzle ORM + Neon client
  - [x] `shared/db/schema.ts` — Full Drizzle schema for ALL tables (see architecture.md §4)
  - [x] `shared/websocket/ws.server.ts` — Socket.IO server setup, `emitToUser()`, `emitToRoom()` helpers
  - [x] `shared/websocket/ws.rooms.ts` — Room join/leave management
  - [x] `shared/middleware/auth.middleware.ts` — JWT validation, attaches `req.user`
  - [x] `shared/middleware/error.middleware.ts` — Global error handler
  - [x] `shared/middleware/logger.middleware.ts` — Request logging
  - [x] `shared/middleware/rate-limit.middleware.ts` — Basic rate limiter
  - [x] `shared/storage/cloudinary.service.ts` — Upload image, return URL
  - [x] `shared/notifications/fcm.service.ts` — Firebase push notification sender
  - [x] `shared/email/resend.service.ts` — Email sender via Resend
- [x] Create startup scripts:
  - [x] `scripts/start.sh` — Starts backend + mobile
  - [x] `scripts/start.bat` — Windows equivalent
  - [x] `scripts/backend.sh` — Backend only
  - [x] `scripts/backend.bat` — Backend only Windows
- [x] Run `npm install` at root — verify workspaces resolve correctly
- [x] Verify `npx tsc --noEmit` passes with stubs

### 🟢 PUSH CHECKPOINT S0
```bash
git add -A && git commit -m "chore: scaffold monorepo + shared-types + backend skeleton + auth middleware + stub routes" && git push origin main
```
> **📢 Notify Dev, Het, Avani:** "Scaffold pushed. Pull `main` and run `npm install` at root. You can now start working in your assigned module directories."

---

## Sprint 1 — Auth + Users + Dashboard Modules

> ⚡ Can start immediately after Sprint 0 push.

- [x] **Auth module** (`apps/backend/src/modules/auth/`):
  - [x] `auth.service.ts` — Register, login (JWT generation), logout, get current user, update language preference
  - [x] `auth.controller.ts` — HTTP handlers calling auth.service
  - [x] `auth.routes.ts` — Replace stub with real routes: POST register, POST login, POST logout, GET me, PATCH language
  - [x] `auth.middleware.ts` — (Shared middleware used; module-specific not needed)
- [x] **Users module** (`apps/backend/src/modules/users/`):
  - [x] `users.service.ts` — Get user by ID, list users by role/dept
  - [x] `users.controller.ts` — HTTP handlers
  - [x] `users.routes.ts` — GET user, list users
- [x] **Dashboard module** (`apps/backend/src/modules/dashboard/`):
  - [x] `dashboard.service.ts` — Aggregate data for student/professor/admin dashboards
  - [x] `dashboard.controller.ts` — HTTP handlers
  - [x] `dashboard.routes.ts` — GET /student, GET /professor, GET /admin

### 🟢 PUSH CHECKPOINT S1
```bash
git add -A && git commit -m "feat: auth, users, dashboard modules" && git push origin main
```
> **📢 Notify Avani:** "Auth API is live. You can now implement the login/register screens and connect to real endpoints."

---

## Sprint 2 — DB Migrations + Seed Data

- [ ] `shared/db/seed.ts` — Create comprehensive seed data script:
  - [ ] 3-5 students (including "Priyank"), 2-3 professors (including "Harshav"), 1 admin
  - [ ] 5+ notices (various departments)
  - [ ] 3+ workflow requests in different stages
  - [ ] 5+ issues with various categories/priorities/locations
  - [ ] 10+ attendance records
  - [ ] 5+ calendar events (classes, bookings)
  - [ ] 3+ finance dues per student
  - [ ] Karma events for demo scoring
  - [ ] 1 pre-registered Canteen Tracker plugin (status: 'approved')
- [ ] Add `npm run seed` script to `apps/backend/package.json`
- [ ] Run `npx drizzle-kit push` — verify all tables created
- [ ] Run `npm run seed` — verify data loads cleanly

### 🟢 PUSH CHECKPOINT S2
```bash
git add -A && git commit -m "feat: DB migrations, seed data" && git push origin main
```
> **📢 Notify everyone:** "Seed data is in. Pull and run `npm run seed` to populate your local DB."

---

## Sprint 3 — Integration Support (Ongoing)

> You are the "glue" person. As Dev, Het, and Avani finish modules and screens, you handle:

- [ ] If anyone needs a new shared-type interface → you add it to `packages/shared-types/` and push
- [ ] If anyone discovers a missing Drizzle schema field → you add it to `schema.ts` and push
- [ ] If WebSocket event helpers need updating → you modify `ws.server.ts`
- [ ] Final pass: verify `apps/backend/src/app.ts` compiles with all real route files (after Dev+Het replace all stubs)
- [ ] Write `.env` files with real API keys (Neon, Cloudinary, Firebase, Grok, Razorpay, Resend, LibreTranslate)
- [ ] End-to-end smoke test: start backend → hit all endpoints → verify responses

---

## ⚠️ Files You MUST NEVER Touch

```
# Dev's modules
apps/backend/src/modules/workflow/*    (except the stub .routes.ts you created)
apps/backend/src/modules/copilot/*
apps/backend/src/modules/notices/*
apps/backend/src/modules/calendar/*
apps/backend/src/modules/analytics/*
apps/backend/src/modules/karma/*

# Het's modules
apps/backend/src/modules/issues/*
apps/backend/src/modules/finance/*
apps/backend/src/modules/attendance/*
apps/backend/src/modules/pyq/*
apps/backend/src/modules/plugins/*
apps/super-app/*

# Avani's mobile app
apps/mobile/*
```

---

## Dependencies & Sync Points

| You depend on | For | When |
|---------------|-----|------|
| Nobody | You go first | Sprint 0 |

| Who depends on you | What they need | Checkpoint |
|--------------------|----------------|------------|
| **Dev, Het, Avani** | Scaffold + shared-types + stub routes + shared infra | After S0 push |
| **Avani** | Auth API live (register/login endpoints working) | After S1 push |
| **Dev, Het** | DB schema + seed data | After S2 push |
| **Everyone** | `.env` with real API keys | Sprint 3 |
