# 🏗️ Het — Backend Modules: Issues, Finance, Attendance, PYQ, Plugins + Super App

> **Role:** Backend Feature Developer — Operations, Payments & Platform Layer
> **Owns:** 5 backend modules + the entire Super App (iframe host shell, aether-bridge.js, Canteen Tracker demo, Developer Portal web UI)

---

## 🔴 PREREQUISITE — Wait for Sid's Sprint 0 Push

**Do NOT start coding until Sid pushes the scaffold commit.**

Once Sid pushes, run:
```bash
git pull origin main
npm install      # from repo root
```

Verify:
- `packages/shared-types/src/` has all type interfaces
- `apps/backend/src/shared/db/neon.client.ts` exists
- `apps/backend/src/shared/middleware/auth.middleware.ts` exists
- `apps/backend/src/modules/issues/issues.routes.ts` exists (stub)
- `apps/backend/src/app.ts` already imports your routes

If all green → start coding. **You never need to touch `app.ts`.**

---

## Files You Own (ONLY you touch these)

```
# Issues Module (ALL files — replace the stub .routes.ts)
apps/backend/src/modules/issues/issues.controller.ts
apps/backend/src/modules/issues/issues.service.ts
apps/backend/src/modules/issues/issues.routes.ts         ← replace stub
apps/backend/src/modules/issues/heatmap.service.ts

# Finance Module
apps/backend/src/modules/finance/finance.controller.ts
apps/backend/src/modules/finance/finance.service.ts
apps/backend/src/modules/finance/finance.routes.ts        ← replace stub
apps/backend/src/modules/finance/payment.service.ts

# Attendance Module
apps/backend/src/modules/attendance/attendance.controller.ts
apps/backend/src/modules/attendance/attendance.service.ts
apps/backend/src/modules/attendance/attendance.routes.ts   ← replace stub

# PYQ Module
apps/backend/src/modules/pyq/pyq.controller.ts
apps/backend/src/modules/pyq/pyq.service.ts
apps/backend/src/modules/pyq/pyq.routes.ts                ← replace stub

# Plugins Module (backend API only)
apps/backend/src/modules/plugins/plugins.controller.ts
apps/backend/src/modules/plugins/plugins.service.ts
apps/backend/src/modules/plugins/plugins.routes.ts         ← replace stub
apps/backend/src/modules/plugins/grok-auditor.service.ts   ← NEW: Grok security audit

# Super App — ENTIRELY NEW DIRECTORY (you create this)
apps/super-app/                    ← Web-based iframe host shell
apps/super-app/package.json
apps/super-app/src/
apps/super-app/src/index.html
apps/super-app/src/App.jsx         ← (or .tsx)
apps/super-app/src/components/
apps/super-app/src/components/HostShell.jsx
apps/super-app/src/components/MiniAppDashboard.jsx
apps/super-app/src/components/DeveloperPortal.jsx
apps/super-app/src/components/AdminAuditView.jsx
apps/super-app/src/components/IframeContainer.jsx

# aether-bridge SDK
libs/aether-bridge/
libs/aether-bridge/aether-bridge.js
libs/aether-bridge/README.md

# Canteen Tracker Demo Mini-App
apps/canteen-tracker/
apps/canteen-tracker/index.html
apps/canteen-tracker/app.js
apps/canteen-tracker/package.json

# Developer Portal Documentation
docs/developer-portal.md
```

---

## Sprint 1 — Issues + Heatmap + Attendance (Top Priority)

> ✅ Sid's S0+S1+S2 pushed. Dev's D4 pushed (karma ready).

### Issues Module

- [x] `issues.service.ts`:
  - [x] `createIssue(reporterId, data: {title, description, category, building, locationX, locationY}, imageFile?)`:
    1. If image provided → upload to Cloudinary via `shared/storage/cloudinary.service.ts` (Sid's file — import it)
    2. INSERT into `issues` table with auto-priority based on category
    3. Emit `issue:created` WebSocket event via `emitToRoom('support', ...)`
    4. Emit `heatmap:update` WebSocket event with new point data
    5. ✅ Karma wired: `addKarmaEvent(reporterId, 'issue_reported', 10)` — imported from Dev's karma module
  - [x] `getIssues(filters)` → List issues, filterable by category/status/building
  - [x] `getIssueById(issueId)` → Single issue with image URL
  - [x] `updateStatus(issueId, status)` → Update issue status (support staff only)
- [x] `heatmap.service.ts`:
  - [x] `getHeatmapData()` → Aggregate issues by location (x,y coordinates + count + category). Return `HeatmapPoint[]`
- [x] `issues.controller.ts` — HTTP handlers (multipart form via Multer for image uploads)
- [x] `issues.routes.ts` — Replace stub:
  - POST `/` — report issue (multipart: image + JSON data)
  - GET `/` — list issues
  - GET `/heatmap` — heatmap data
  - PATCH `/:id/status` — update status

> **Multer setup:** Import Multer from Sid's installed dependencies. Configure 10MB limit. Pass to route middleware.

### Attendance Module

- [x] `attendance.service.ts`:
  - [x] `markAttendance(professorId, classId, subject, date, students: {studentId, isPresent}[])` → Bulk insert into `attendance_records`
  - [x] `getClassAttendance(classId)` → List attendance records for a class
  - [x] `getStudentSummary(studentId)` → Attendance percentage across all classes
  - [x] `getTrends(professorId)` → Aggregate trends for professor's classes
  - [x] After marking: emit `attendance:updated` WebSocket event
- [x] `attendance.controller.ts` — HTTP handlers
- [x] `attendance.routes.ts` — Replace stub:
  - POST `/mark` — mark attendance
  - GET `/class/:classId` — get class attendance
  - GET `/student/:studentId` — student summary
  - GET `/trends` — professor trends

### 🟢 PUSH CHECKPOINT H1
```bash
git add -A && git commit -m "feat: issues + heatmap + attendance modules" && git push origin main
```
> **📢 Notify Avani:** "Issues API (with camera upload) and attendance API are live."

---

## Sprint 2 — Finance + Razorpay + PYQ

### Finance Module

- [x] `payment.service.ts`:
  - [x] `createOrder(dueId, amount)` → Call Razorpay API to create an order, return `orderId`
  - [x] `verifyPayment(razorpayPaymentId, razorpayOrderId, razorpaySignature)` → Verify HMAC signature server-side. If valid → mark due as `paid`. If invalid → reject.
  - [x] ⚠️ **NEVER trust mobile for payment confirmation.** Always verify signature on backend.
- [x] `finance.service.ts`:
  - [x] `getDues(studentId)` → List pending finance dues
  - [x] `initiatePay(studentId, dueId)` → Call `createOrder`, return orderId to mobile
  - [x] `confirmPay(paymentData)` → Call `verifyPayment`, update `finance_dues.status` to 'paid'
- [x] `finance.controller.ts` — HTTP handlers
- [x] `finance.routes.ts` — Replace stub:
  - GET `/dues` — list my dues
  - POST `/pay/:dueId` — initiate Razorpay order
  - POST `/verify` — verify payment signature

### PYQ Module

- [x] `pyq.service.ts`:
  - [x] `searchPapers(query, filters?)` → Query DSpace REST API (or mock data if DSpace unavailable)
  - [x] `getPaperById(paperId)` → Single paper with download URL
  - [x] `syncFromDSpace()` → Trigger scraper to refresh local cache (admin only)
- [x] `pyq.controller.ts` — HTTP handlers
- [x] `pyq.routes.ts` — Replace stub:
  - GET `/papers` — search/list PYQs
  - GET `/papers/:id` — paper detail
  - POST `/sync` — trigger refresh (admin)

### 🟢 PUSH CHECKPOINT H2
```bash
git add -A && git commit -m "feat: finance + razorpay + pyq modules" && git push origin main
```
> **📢 Notify Avani:** "Finance (with Razorpay) and PYQ APIs are live."

---

## Sprint 3 — Plugins Backend + Super App Host Shell + aether-bridge.js

> This is the Super App architecture. Read PRD F8 and architecture.md §13 carefully before starting.

### Plugins Backend Module

- [x] `grok-auditor.service.ts`:
  - [x] `generateSecurityAudit(pluginSubmission: { name, deploymentUrl, category, permissions[] })`:
    1. Build Grok prompt: "You are a security auditor. Analyze this web app submission for risks..."
    2. Call Grok API (same `XAI_API_KEY` as copilot) with structured output format
    3. Parse response into `SecurityClearanceCertificate` type: `{ riskLevel, findings[], recommendation, compliance }`
    4. Return structured certificate
- [x] `plugins.service.ts`:
  - [x] `submitPlugin(submittedBy, data: {name, description, category, deploymentUrl, permissions[]})`:
    1. INSERT into `plugins` table with status='pending'
    2. Call `grok-auditor.service.ts:generateSecurityAudit()`
    3. Store the certificate in `plugins.grok_audit_report` (JSONB)
    4. Return the plugin record + audit report
  - [x] `getPlugins()` → List all active/approved plugins
  - [x] `getPluginBySlug(slug)` → Single plugin with audit report
  - [x] `approvePlugin(pluginId)` → Set status='approved', is_active=true. Emit WebSocket `plugin:approved`
  - [x] `rejectPlugin(pluginId)` → Set status='rejected'
  - [x] `getPlugin(pluginId)` → Single plugin detail with audit report
- [x] `plugins.controller.ts` — HTTP handlers
- [x] `plugins.routes.ts` — Replace stub:
  - GET `/` — list active plugins
  - GET `/:slug` — plugin detail
  - POST `/` — submit new plugin (triggers Grok audit)
  - PATCH `/:id/approve` — admin approve
  - PATCH `/:id/reject` — admin reject

### Super App Host Shell (NEW WEB APP)

> ✅ **Built as a Vite + React web app.**

- [x] Create `apps/super-app/` directory
- [x] Initialize with Vite: `npx -y create-vite@latest ./ --template react` (from inside `apps/super-app/`)
- [ ] Update root `package.json` workspaces to include `apps/super-app`
  - ⚠️ **SYNC WITH SID:** Ask Sid to add `"apps/super-app"` to root workspaces OR add it yourself if Sid confirms
- [x] Build components:
  - [x] `MiniAppDashboard.jsx` — Fetches `GET /api/plugins` and renders plugin icons grid
  - [x] `IframeContainer.jsx` — Opens plugin URL in sandboxed iframe. After iframe loads, sends `postMessage({ type: 'AETHER_INIT', payload: { userName, role, department } })`
  - [x] `DeveloperPortal.jsx` — Form: Title, Description, Category, Deployment URL. On submit → POST `/api/plugins`. Show "Scanning..." animation while waiting for Grok audit. Show Security Clearance Certificate card when response arrives.
  - [x] `AdminAuditView.jsx` — List pending plugins with their Grok audit reports. Approve/Reject buttons.
  - [x] `HostShell.jsx` — Main shell component wrapping dashboard + portal + iframe views

### aether-bridge.js SDK

- [x] Create `libs/aether-bridge/aether-bridge.js`:
  ```javascript
  const AetherBridge = {
    user: null,
    onReady(callback) {
      window.addEventListener('message', (event) => {
        if (event.data.type === 'AETHER_INIT') {
          this.user = event.data.payload;
          callback(this.user);
        }
      });
    }
  };
  ```
- [x] Create `libs/aether-bridge/README.md` — Quick-start guide for mini-app developers

### Canteen Tracker Demo Mini-App

- [x] Create `apps/canteen-tracker/` — Simple HTML+JS app
- [x] Include `aether-bridge.js` via script tag
- [x] On `AetherBridge.onReady()` → display "Welcome, {userName}!" + a mock canteen menu
- [ ] Deploy to Vercel (or serve locally for demo)
- [ ] Ensure this URL is registered in the seed data (ask Sid to add it to `seed.ts`)

### Developer Portal Documentation

- [x] Write `docs/developer-portal.md`:
  - How to build a mini-app
  - How to include `aether-bridge.js`
  - Available scoped data: `{ userName, role, department }`
  - How to submit via Developer Portal
  - Security audit process

### 🟢 PUSH CHECKPOINT H3
```bash
git add -A && git commit -m "feat: plugins backend + super app host shell + aether-bridge + canteen tracker" && git push origin main
```
> **📢 Notify Sid:** "Please add `apps/super-app` and `apps/canteen-tracker` to root workspaces if not already done. Also add canteen tracker URL to seed data."
> **📢 Notify Avani:** "Plugins API is live if you need to display plugin list on mobile dashboard too."

---

## ⚠️ Files You MUST NEVER Touch

```
# Sid's files
package.json (root)               ← Coordinate with Sid if workspace changes needed
packages/shared-types/*
apps/backend/src/app.ts
apps/backend/src/server.ts
apps/backend/src/shared/*
apps/backend/src/modules/auth/*
apps/backend/src/modules/users/*
apps/backend/src/modules/dashboard/*
scripts/*

# Dev's modules
apps/backend/src/modules/workflow/*
apps/backend/src/modules/copilot/*
apps/backend/src/modules/notices/*
apps/backend/src/modules/calendar/*
apps/backend/src/modules/analytics/*
apps/backend/src/modules/karma/*

# Avani's mobile app
apps/mobile/*
```

---

## Dependencies & Sync Points

| You depend on | For | When |
|---------------|-----|------|
| **Sid** | Scaffold + shared-types + shared infra + stub routes | Pull after Sid's S0 push |
| **Sid** | DB schema + Cloudinary service | Pull after Sid's S2 push |
| **Dev** | `karma.service.ts:addKarmaEvent()` to log karma on issue report | Pull after Dev's D4 push (add import to issues.service.ts) |
| **Sid** | Root `package.json` workspaces update for `apps/super-app` | Coordinate during Sprint 3 |

| Who depends on you | What they need | Checkpoint |
|--------------------|----------------|------------|
| **Avani** | Issues API (camera upload, heatmap data) | After H1 push |
| **Avani** | Attendance API (mark, trends) | After H1 push |
| **Avani** | Finance API (dues, Razorpay payment flow) | After H2 push |
| **Avani** | PYQ API (search, download) | After H2 push |
| **Sid** | Canteen Tracker URL for seed data | During H3 sprint |

---

## Quick Reference — API Contracts You're Implementing

| Module | Endpoints |
|--------|-----------|
| Issues | POST `/`, GET `/`, GET `/heatmap`, PATCH `/:id/status` |
| Attendance | POST `/mark`, GET `/class/:classId`, GET `/student/:studentId`, GET `/trends` |
| Finance | GET `/dues`, POST `/pay/:dueId`, POST `/verify` |
| PYQ | GET `/papers`, GET `/papers/:id`, POST `/sync` |
| Plugins | GET `/`, GET `/:slug`, POST `/`, PATCH `/:id/approve`, PATCH `/:id/reject` |
