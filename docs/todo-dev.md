# 🧠 Dev — Backend Feature Modules: Workflow, Copilot, Notices, Calendar, Analytics, Karma

> **Role:** Backend Feature Developer — Intelligence & Workflow Layer
> **Owns:** 6 backend modules — `workflow`, `copilot`, `notices`, `calendar`, `analytics`, `karma`

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
- `apps/backend/src/modules/workflow/workflow.routes.ts` exists (stub)
- `apps/backend/src/app.ts` already imports your routes

If all green → start coding. **You never need to touch `app.ts`.**

---

## Files You Own (ONLY you touch these)

```
# Workflow Module (ALL files except the stub .routes.ts Sid created — you REPLACE the stub)
apps/backend/src/modules/workflow/workflow.controller.ts
apps/backend/src/modules/workflow/workflow.service.ts
apps/backend/src/modules/workflow/workflow.routes.ts       ← replace stub
apps/backend/src/modules/workflow/approver-resolver.ts

# Copilot Module
apps/backend/src/modules/copilot/copilot.controller.ts
apps/backend/src/modules/copilot/copilot.service.ts
apps/backend/src/modules/copilot/copilot.routes.ts         ← replace stub
apps/backend/src/modules/copilot/context-builder.ts
apps/backend/src/modules/copilot/translation.service.ts

# Notices Module
apps/backend/src/modules/notices/notices.controller.ts
apps/backend/src/modules/notices/notices.service.ts
apps/backend/src/modules/notices/notices.routes.ts          ← replace stub

# Calendar Module
apps/backend/src/modules/calendar/calendar.controller.ts
apps/backend/src/modules/calendar/calendar.service.ts
apps/backend/src/modules/calendar/calendar.routes.ts        ← replace stub
apps/backend/src/modules/calendar/clash-detector.ts

# Analytics Module
apps/backend/src/modules/analytics/analytics.controller.ts
apps/backend/src/modules/analytics/analytics.service.ts
apps/backend/src/modules/analytics/analytics.routes.ts      ← replace stub

# Karma Module
apps/backend/src/modules/karma/karma.controller.ts
apps/backend/src/modules/karma/karma.service.ts
apps/backend/src/modules/karma/karma.routes.ts              ← replace stub
```

---

## Sprint 1 — Workflow Engine + Notices (Top Priority)

> ⏳ Wait for: Sid's S0 push (scaffold + shared-types + shared infra)

### Workflow Module

- [x] `approver-resolver.ts`:
  - [x] Given a request type (`room_booking` | `certificate` | `leave`) and requester's department, return the ordered approval chain
  - [x] Chain: `[HoD of department] → [Admin coordinator] → [Dean]`
  - [x] Query `users` table to find approvers by role + department
- [x] `workflow.service.ts`:
  - [x] `createRequest(requesterId, type, metadata)` → Create `workflow_requests` row + auto-generate `approval_stages` using approver-resolver
  - [x] `getRequestsByUser(userId)` → List all requests with their approval stage statuses
  - [x] `getRequestById(requestId)` → Single request + full approval chain
  - [x] `getPendingForApprover(approverId)` → Requests awaiting this approver's action
  - [x] `approveStage(requestId, approverId, note?)` → Mark stage as approved, advance to next stage. If final stage → mark request `approved`, emit `approval:updated` WebSocket event, emit `notification:push` to requester
  - [x] `rejectStage(requestId, approverId, note)` → Mark stage + request as rejected, emit events
- [x] `workflow.controller.ts` — HTTP layer calling service methods
- [x] `workflow.routes.ts` — Replace stub with real routes:
  - POST `/request` — submit request
  - GET `/requests` — my requests
  - GET `/requests/:id` — single request
  - GET `/pending` — pending my approval
  - POST `/requests/:id/approve` — approve
  - POST `/requests/:id/reject` — reject

> **WebSocket usage:** Import `emitToUser`, `emitToRoom` from `../../shared/websocket/ws.server`. Sid owns those helpers — they will exist when you pull.

### Notices Module

- [x] `notices.service.ts`:
  - [x] `createNotice(authorId, title, content, targetRole, department)` → INSERT into notices table. **NO RAG indexing, NO external calls.** Just a DB insert.
  - [x] `getNotices(filters: { department?, targetRole? })` → List notices, filterable
  - [x] `getNoticeById(noticeId)` → Single notice
  - [x] After insert: emit `notice:new` WebSocket event
- [x] `notices.controller.ts` — HTTP layer
- [x] `notices.routes.ts` — Replace stub:
  - POST `/` — publish notice (professor only)
  - GET `/` — list notices
  - GET `/:id` — single notice

### 🟢 PUSH CHECKPOINT D1
```bash
git add -A && git commit -m "feat: workflow engine + approver resolver + notices module" && git push origin main
```
> **📢 Notify Avani:** "Workflow and notices APIs are live. You can connect the booking request form, approval bar, and notices publisher."

---

## Sprint 2 — AI Copilot (Grok Direct API — NO RAG)

> ⚠️ **CRITICAL RULE:** Do NOT implement any RAG pipeline. No Pinecone. No LangChain. No vector embeddings. See PRD F3 and project-context.md.

- [x] `context-builder.ts`:
  - [x] `buildCopilotContext(userId)`:
    1. Fetch last 10 notices for user's department from DB
    2. Fetch pending `workflow_requests` for user
    3. Fetch pending `finance_dues` for user
    4. Fetch user profile (name, role, department, karma_score, preferred_language)
    5. Return structured context object
- [x] `translation.service.ts`:
  - [x] `translate(text, targetLanguage)` — Call LibreTranslate API (or Google Translate fallback)
  - [x] Only called when `preferred_language !== 'en'`
  - [x] Called AFTER Grok responds, never before
- [x] `copilot.service.ts`:
  - [x] `chat(userId, message)`:
    1. Call `buildCopilotContext(userId)`
    2. Compose Grok prompt:
       ```
       System: You are Aether Copilot, the campus AI assistant for [University].
       Context:
         - Recent Notices: [list]
         - User: [profile]
         - Pending Requests: [list]
         - Finance Dues: [list]
       User Message: [message]
       Instruction: Answer concisely with 2-3 actionable steps.
       ```
    3. Call Grok API (`POST https://api.x.ai/v1/chat/completions`) with `XAI_API_KEY`
    4. If `preferred_language !== 'en'` → call `translate(response)`
    5. Append to `copilot_sessions` in DB
    6. Return response
  - [x] `getSession(userId)` — Fetch conversation history from `copilot_sessions`
  - [x] `getProactiveAlerts(userId)` — **Deterministic DB queries ONLY, no Grok call:**
    - Check `workflow_requests` where status='pending'
    - Check `finance_dues` where status='pending'
    - Check `calendar_events` where deadline < NOW()+2days
    - Return structured alert array
- [x] `copilot.controller.ts` — HTTP handlers
- [x] `copilot.routes.ts` — Replace stub:
  - POST `/chat` — send message
  - GET `/session` — conversation memory
  - POST `/proactive` — fetch alerts
  - GET `/languages` — list supported languages

### 🟢 PUSH CHECKPOINT D2
```bash
git add -A && git commit -m "feat: AI copilot — direct Grok API + context builder + translations" && git push origin main
```
> **📢 Notify Avani:** "Copilot API is live. POST /api/copilot/chat with `{ message }` and GET /api/copilot/proactive."

---

## Sprint 3 — Calendar + Clash Detection

- [x] `clash-detector.ts`:
  - [x] `detectClash(room, startTime, endTime)` → Query `calendar_events` for overlapping ranges in the same room. Return `{ hasClash: boolean, conflictingEvents: [] }`
  - [x] `suggestSlots(room, date, userSchedule)` → Find 3 available time slots for the given room that don't conflict with user's existing events
- [x] `calendar.service.ts`:
  - [x] `getEvents(userId, startDate, endDate)` → List all events in range for user
  - [x] `getRoomAvailability(room)` → Check room's booked/free slots
  - [x] `bookRoom(userId, room, startTime, endTime)` → Run clash detection first; if clear, create event with `is_locked = true`. If clash, return suggestions.
  - [x] `checkClash(room, startTime, endTime)` → Expose clash detection as standalone endpoint
  - [x] `getSmartSuggestions(room, date, userId)` → Return 3 best slots
- [x] `calendar.controller.ts` — HTTP handlers
- [x] `calendar.routes.ts` — Replace stub:
  - GET `/events` — list events
  - GET `/rooms` — list rooms with availability
  - POST `/book` — book slot
  - GET `/clash-check` — check clash
  - GET `/suggestions` — smart suggestions

### 🟢 PUSH CHECKPOINT D3
```bash
git add -A && git commit -m "feat: calendar module + clash detection + smart suggestions" && git push origin main
```
> **📢 Notify Avani:** "Calendar API is live including clash detection."

---

## Sprint 4 — Analytics + Karma

### Analytics Module

- [x] `analytics.service.ts`:
  - [x] `getAttendanceTrends()` → Aggregate attendance by department/class
  - [x] `getApprovalBottlenecks()` → Avg time per approval stage, identify the slowest approver
  - [x] `getIssueStats()` → Open/closed count, age distribution, resolution rate, category breakdown
  - [x] Use seeded data — real DB queries but against Sid's seed data
- [x] `analytics.controller.ts` — HTTP handlers
- [x] `analytics.routes.ts` — Replace stub:
  - GET `/attendance`
  - GET `/approvals`
  - GET `/issues`

### Karma Module

- [x] `karma.service.ts`:
  - [x] `getScore(userId)` → Sum of `karma_events.points` for user
  - [x] `getBreakdown(userId)` → List of karma events with types + points
  - [x] `getLeaderboard()` → Top 10 students by karma
  - [x] `addKarmaEvent(userId, eventType, points)` — Called by other modules (issues, attendance, etc.)
- [x] `karma.controller.ts` — HTTP handlers
- [x] `karma.routes.ts` — Replace stub:
  - GET `/score`
  - GET `/leaderboard`

### 🟢 PUSH CHECKPOINT D4
```bash
git add -A && git commit -m "feat: analytics + karma modules" && git push origin main
```
> **📢 Notify Avani:** "Analytics and karma APIs are live."

---

## ⚠️ Files You MUST NEVER Touch

```
# Sid's files
package.json (root)
packages/shared-types/*
apps/backend/src/app.ts
apps/backend/src/server.ts
apps/backend/src/shared/*
apps/backend/src/modules/auth/*
apps/backend/src/modules/users/*
apps/backend/src/modules/dashboard/*
scripts/*

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
| **Sid** | Scaffold + shared-types + shared infra + stub routes | Pull after Sid's S0 push |
| **Sid** | DB schema (tables must exist) | Pull after Sid's S2 push |

| Who depends on you | What they need | Checkpoint |
|--------------------|----------------|------------|
| **Avani** | Workflow API (room booking, approvals, progress bar) | After D1 push |
| **Avani** | Copilot API (chat, proactive) | After D2 push |
| **Avani** | Calendar API (events, clash, suggestions) | After D3 push |
| **Avani** | Analytics + Karma APIs | After D4 push |
| **Het** | `karma.service.ts:addKarmaEvent()` — Het's issue module calls this when issue is reported | After D4 push (Het imports your function) |

---

## Quick Reference — API Contracts You're Implementing

| Module | Endpoints |
|--------|-----------|
| Workflow | POST `/request`, GET `/requests`, GET `/requests/:id`, GET `/pending`, POST `/requests/:id/approve`, POST `/requests/:id/reject` |
| Notices | POST `/`, GET `/`, GET `/:id` |
| Copilot | POST `/chat`, GET `/session`, POST `/proactive`, GET `/languages` |
| Calendar | GET `/events`, GET `/rooms`, POST `/book`, GET `/clash-check`, GET `/suggestions` |
| Analytics | GET `/attendance`, GET `/approvals`, GET `/issues` |
| Karma | GET `/score`, GET `/leaderboard` |
