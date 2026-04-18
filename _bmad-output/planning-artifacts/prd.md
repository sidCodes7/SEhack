---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
project: Aether — Autonomous Campus Operating System
version: 1.0.0
status: final
date: 2026-04-18
authors: [Priyank, Harshav]
inputDocuments:
  - brainstorming-session-2026-04-18-1310.md
  - architecture.md
  - project-context.md
  - problem-statement-aether.md
---

# Product Requirements Document
# Aether — Autonomous Campus Operating System

> **Tagline:** "Above the chaos of campus — Aether."
> A modular, role-based Campus Operating System that unifies academic, administrative, and social workflows into a single, high-integrity mobile interface.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Vision & Product Goals](#3-vision--product-goals)
4. [Users & Personas](#4-users--personas)
5. [User Journeys](#5-user-journeys)
6. [Feature Requirements](#6-feature-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Technical Constraints & Architecture Context](#8-technical-constraints--architecture-context)
9. [MVP Scope & Prioritization](#9-mvp-scope--prioritization)
10. [Innovation & Differentiation](#10-innovation--differentiation)
11. [Success Metrics](#11-success-metrics)
12. [Roadmap & Future Considerations](#12-roadmap--future-considerations)

---

## 1. Executive Summary

Indian universities operate as **fragmented silos**. Communication is buried in WhatsApp groups, approvals rot in email chains, and resource scheduling requires physical signatures. Students carry an invisible cognitive tax: knowing where their leave request went, when their scholarship window closes, which room is available, which paper is due. Faculty are drowning in coordination overhead that has nothing to do with teaching.

**Aether is the missing operating layer.**

It is not a campus app — it is a **Campus OS**: a modular, role-based mobile platform that unifies every academic, administrative, and social workflow into one coherent, intelligent interface. Every user — student, professor, or administrator — sees exactly what they need, when they need it, with zero-latency real-time updates.

The two-line pitch:

> *Priyank sees his next class, club alerts, and karma score. His professor approves his room booking in one tap. The AI Copilot answers his question in Hindi — from the notice the professor just published. That's Aether.*

**Target Platform:** Mobile-first (iOS + Android via React Native / Expo Go)  
**Primary Stack:** React Native + Expo · Node.js + Express · Neon PostgreSQL · Grok LLM (direct API) · Socket.IO  
**Demo Context:** 24-hour hackathon — SEhack 2026

---

## 2. Problem Statement

### Context

Indian higher education institutions serve millions of students across thousands of campuses. Despite the scale, the operational infrastructure remains deeply manual:

| Pain Area | Current State | Impact |
|-----------|--------------|--------|
| Communication | WhatsApp groups, email blasts, physical notice boards | Information asymmetry; students miss critical deadlines |
| Approvals | Physical forms, in-person signatures, office visits | Multi-day delays for simple requests (room booking, certificates, leave) |
| Resource Scheduling | Spreadsheets, phone calls, manual room logs | Double-booking, conflicts, opaque availability |
| Academic Tracking | Manually maintained registers, CSV exports | Professors lack real-time attendance trends; students unaware of their standing |
| Issue Resolution | Verbal complaints, informal emails | No accountability, no visibility, problems persist |
| Financial Settlement | Cash counters, manual due records | Students discover dues at the worst possible moment |
| Knowledge Access | Poorly UX'd university portals, physical libraries | PYQ papers are hard to find; AI assistance is non-existent |

### Root Cause

There is **no common digital operating layer** across campus functions. Every department runs its own silo. The cognitive load this creates is enormous — for both students navigating it and faculty managing it.

### Hypothesis

A unified, role-aware mobile platform with an embedded AI layer can eliminate the majority of friction in daily campus operations, reduce administrative overhead significantly, and create a measurably better campus experience.

---

## 3. Vision & Product Goals

### Product Vision

**Aether is the campus operating system** for Indian universities — the single interface where every academic, administrative, and social action happens. It is intelligent enough to know what you need before you ask, transparent enough to show you exactly where your request is stuck, and extensible enough to grow with every campus need.

### Strategic Goals (Hackathon Context)

| Goal | Description |
|------|-------------|
| **G1 — Feature Completeness** | Demonstrate all 7 PS features + 2 brownie features in a working, live demo |
| **G2 — Demo Conviction** | Every "real-time" claim must be actually real-time. No smoke. |
| **G3 — Category Creation** | Position Aether as infrastructure, not an app — a Campus OS |
| **G4 — India-First Identity** | Hindi Copilot + context-aware AI as the emotional anchor |
| **G5 — Platform Story** | Prove the Super App extensibility architecture with a live plugin install |

### Long-Term Vision (Post-Hackathon)

- Scale to 1,000+ universities across India
- 40 million student TAM
- Generalize the Workflow Engine to hospitals, government bodies, corporate HR
- Developer ecosystem of 3rd-party campus mini-apps

---

## 4. Users & Personas

### Primary Personas

#### 🎓 Priyank — The Engineering Student
- **Role:** B.Tech 3rd Year, CSE Department
- **Goals:** Submit room booking requests without following up with HoD physically; find PYQ papers for upcoming exams; pay library fines without visiting the finance counter; know his attendance status before it becomes a problem
- **Pain Points:** Request black holes (no idea where his leave application went); duplicate class bookings; missing scholarship deadlines because nobody told him
- **Device:** Android smartphone, always on campus WiFi
- **Key Flows:** Dashboard → AI Copilot → Room Booking → Calendar → PYQ → Finance Dues

#### 👨‍🏫 Harshav — The Exhausted Professor
- **Role:** Assistant Professor, CSE Department
- **Goals:** Mark attendance in 30 seconds from his phone; one-tap approve routine leave requests; publish a notice that students actually see; follow up on at-risk students without context-switching between spreadsheets and emails
- **Pain Points:** 20-minute attendance marking process; leave request emails buried in inbox; no visibility into student engagement trends
- **Device:** iOS smartphone + laptop
- **Key Flows:** Professor Dashboard → Attendance → Leave Approvals → Notices → Student Follow-ups

#### 🏛️ Dean / Admin — The Decision-Maker
- **Role:** Department Head or Principal
- **Goals:** Understand where administrative bottlenecks are happening; approve high-urgency requests from anywhere; see campus operational health at a glance
- **Pain Points:** No aggregated view of approval delays; issues with facilities discovered reactively; no data for operational decisions
- **Device:** Tablet + desktop
- **Key Flows:** Admin Analytics Dashboard → Approval Queue → Issue Heatmap → Bottleneck Alerts

### Secondary Personas

- **HoD (Head of Department)** — First approver in the workflow chain; receives push notifications for pending approvals
- **Support Staff** — Receives priority-ticketed facility issues; updates resolution status
- **Student Developer (future)** — Builds mini-app plugins using the Aether Developer API

---

## 5. User Journeys

### Journey 1 — Student: Room Booking Request

```
Student opens Aether
  → Dashboard shows "Book a Room" quick action
  → Navigates to Bookings screen
  → Selects date, time, room (clash detection runs → confirms no conflict)
  → Submits request
  → Swiggy-style Progress Bar appears: "Stage 1/3: HoD 🕐"
  → HoD receives push notification → one-tap approves on Professor Dashboard
  → Progress Bar advances: "Stage 2/3: Stucco ✅ → Stage 3/3: Dean 🕐"
  → Student receives push notification on final approval
  → Calendar event auto-created
```

### Journey 2 — Professor: Notice → Copilot Intelligence Loop

```
Professor opens Faculty Workspace
  → Publishes notice: "Mini Project deadline: April 22nd, 11:59 PM"
  → Notice stored in DB (notices table); is_indexed flag set for Copilot awareness
  → Student opens AI Copilot (floating button on any screen)
  → Asks in Hindi: "Mini project kab submit karna hai?"
  → Backend: fetches recent notices from DB → injects as context into Grok prompt
  → Grok API call (direct) → if language ≠ en → LibreTranslate → returns answer
  → Student gets: "22 April, raat 11:59 baje tak submit karna hai."
```

### Journey 3 — Student: Issue Reporting + Live Heatmap

```
Student notices broken projector in Lab 302
  → Opens Issues tab → "Report Issue"
  → Camera opens → Takes photo → Adds description + selects building
  → Submits (image → Cloudinary via backend; location tagged)
  → Support team receives priority ticket via push notification
  → Campus heatmap shows new dot on Building C in real-time (WebSocket event)
  → Admin sees updated issue density in Analytics Dashboard
```

### Journey 4 — Student: Finance Dues & UPI Payment

```
Student checks Dashboard → "Finance Due: ₹120 Library Fine" badge
  → Opens Finance screen → Itemized dues list
  → Selects library fine → "Pay Now"
  → Razorpay checkout opens → Completes UPI payment (test mode)
  → Backend verifies Razorpay HMAC signature → marks due as paid in DB
  → Dashboard finance badge clears
```

### Journey 5 — Student: PYQ Discovery

```
Student opens PYQ screen
  → Searches: "Data Structures 2023"
  → DSpace scraper returns matching papers from university repository
  → Views paper metadata → downloads PDF
```

### Journey 6 — AI Copilot: Proactive Guardian

```
Student opens Aether → GET /api/copilot/proactive runs on load
  → Rule-based check: scholarship deadline in 2 days + 2 pending workflow steps
  → Copilot proactively surfaces: "Your scholarship application closes in 2 days.
     Here are 3 steps you still need to complete."
  → Student taps steps → navigated directly to relevant screens
```

### Journey 7 — Admin: Analytics & Decision Intelligence

```
Admin opens Admin Analytics Dashboard
  → Sees: Approval delay heatmap — Stucco is bottleneck (avg 3.2 day delay)
  → Sees: Issue resolution rate — 73% resolved within 48hrs, 27% aging
  → Sees: Attendance trends — 3 sections below 75% threshold (auto-flagged)
  → Admin responds: sends nudge notification to Stucco directly from dashboard
```

---

## 6. Feature Requirements

### F1 — Role-Aware Intelligent Mobile Dashboard

**Priority:** P0 — Must Ship  
**PS Reference:** Feature 1

#### Description
The primary entry point for every user. Widgets and push notifications are dynamically composed based on the authenticated user's role, department, and real-time data state.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| F1.1 | System must display a personalized dashboard with role-specific widgets upon login |
| F1.2 | Student dashboard must include: Next class location + time, Club event alerts, Karma Score chip, Finance due badge, Pending requests count |
| F1.3 | Professor dashboard must include: Attendance trends widget, Pending leave approvals count, Pending student follow-ups, Recent notices published |
| F1.4 | Admin dashboard must show: Open issues count, pending approvals count, recent activity feed |
| F1.5 | Dashboard must update in real-time via WebSocket events without requiring page refresh |
| F1.6 | Push notifications (FCM) must be delivered for all actionable events (approvals, notices, issue updates) |
| F1.7 | Karma Score widget must display current score as a gold chip |
| F1.8 | All dashboard data must be fetched from `GET /api/dashboard/{role}` endpoint |

#### Acceptance Criteria
- [ ] Student can see their next class, club alerts, karma score, and finance badge on first login
- [ ] Professor can see attendance trends and pending approvals without navigating away from the dashboard
- [ ] Any approval action triggers a real-time dashboard widget update within 2 seconds

---

### F2 — Smart Mobile Workflow & Approvals Engine

**Priority:** P0 — Must Ship  
**PS Reference:** Feature 2

#### Description
A digital "Chain of Responsibility" for campus processes. The system auto-identifies the correct approval chain (HoD → Stucco → Dean), tracks multi-stage progress in real-time, and notifies all parties via push.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| F2.1 | Students must be able to submit workflow requests of types: `room_booking`, `certificate`, `leave` |
| F2.2 | System must auto-resolve the approval chain based on request type and requester's department via `approver-resolver.ts` |
| F2.3 | Each approval stage must represent one named approver (HoD → Stucco → Dean), all visible in the UI |
| F2.4 | Approvers must receive an immediate push notification when a request reaches their stage |
| F2.5 | Approvers must be able to approve or reject requests with an optional note in a single tap |
| F2.6 | A Swiggy-style approval progress bar must update in real-time via the `approval:updated` WebSocket event |
| F2.7 | Final approval must trigger: push notification to requester, and calendar event creation for room bookings |
| F2.8 | Rejected requests must display the rejecting approver's note |
| F2.9 | All state changes must be persisted in `workflow_requests` and `approval_stages` tables |

#### Acceptance Criteria
- [ ] Submitting a room booking triggers HoD notification within 5 seconds
- [ ] Approval bar advances on the student's screen within 3 seconds of HoD approving on a second device (two-phone validation)
- [ ] Full 3-stage chain completes end-to-end without manual workarounds

#### WF Enhancement — WF#8: Swiggy Progress Bar
Approval stages rendered as named steps with status icons (✅ approved · 🕐 pending · ❌ rejected), mirroring the delivery-tracking UX students already trust.

---

### F3 — AI Campus Copilot

**Priority:** P0 — Must Ship  
**PS Reference:** Feature 3

#### Description
A context-aware mobile AI assistant powered by **direct Grok API calls with DB-injected context** (no RAG pipeline, no vector store). The Copilot answers natural language questions using live campus data fetched from the database and composed into the Grok prompt, surfaces proactive alerts before the user asks, and responds in the user's preferred Indian language.

> ⚠️ **IMPLEMENTATION NOTE — CRITICAL:** Do NOT implement a RAG pipeline. Do NOT use Pinecone, LangChain, or any vector embedding service. The Copilot intelligence is achieved by: (1) querying the Neon PostgreSQL DB for relevant notices, workflow data, and user context, (2) injecting that data as structured context into a Grok API prompt, and (3) calling the Grok API directly. This is the only approved approach for this prototype.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| F3.1 | Copilot must be accessible via a floating action button (FAB) on every screen |
| F3.2 | Users must be able to submit text queries |
| F3.3 | On receiving a query, backend must: (1) fetch the 10 most recent notices from DB for the user's department, (2) fetch the user's pending workflow requests and dues from DB, (3) compose a structured context block, (4) make a single Grok API chat completion call with the context + user message |
| F3.4 | Copilot must answer from live notice content published by professors — notices are fetched fresh from DB on each query, NOT from a vector store |
| F3.5 | Proactive alerts must surface on app open via `GET /api/copilot/proactive` (rule-based, deterministic check — NOT a Grok call) |
| F3.6 | Proactive rules must cover: scholarship deadline proximity, pending dues, low karma, pending workflow steps |
| F3.7 | Non-English responses must be translated via LibreTranslate AFTER Grok completes (never before) |
| F3.8 | Supported output languages: English (`en`), Hindi (`hi`), Tamil (`ta`), Marathi (`mr`), Telugu (`te`) |
| F3.9 | Conversation history must be persisted in `copilot_sessions` table per user |
| F3.10 | Every Copilot response must provide actionable next steps, not just information |

#### Grok Prompt Structure (Implementation Reference)

```
System: You are Aether Copilot, the campus AI assistant for [University Name].
Context:
  - Recent Notices: [list of DB-fetched notices with titles and content]
  - User: [name, role, department, karma_score]
  - Pending Requests: [list of workflow_requests with status]
  - Finance Dues: [list of outstanding dues]
User Message: [student's natural language query]
Instruction: Answer concisely. Provide 2-3 actionable next steps.
```

#### Acceptance Criteria
- [ ] Professor publishes notice → student asks about it → Copilot answers from that notice (fetched from DB)
- [ ] Hindi query returns a coherent Hindi response
- [ ] Proactive alert appears within 3 seconds of app open when a deadline is approaching
- [ ] Copilot FAB is visible and functional on all screens
- [ ] No Pinecone, LangChain, or vector embedding code exists anywhere in the codebase

#### WF Enhancements Applied
- **WF#4 — Semester Memory:** Copilot surfaces semester-aware proactive alerts (e.g., "Scholarship window closes in 2 days") — via rule-based DB check, deterministic
- **WF#5 — Mother Tongue Support:** Hindi/regional responses for first-gen students — India-first accessibility story
- **WF#6 — Notice→Copilot Loop:** Notices stored in DB; fetched fresh on each Copilot query — Copilot always sees the latest published notices

---

### F4 — Faculty Coordination Workspace

**Priority:** P0 — Must Ship  
**PS Reference:** Feature 4

#### Description
A specialized toolset for professors to manage attendance, student advising, leave approvals, and notice publishing from a single mobile interface — zero context-switching required.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| F4.1 | Professors must be able to mark class attendance by selecting a class and tapping student names |
| F4.2 | Attendance data must be persisted in `attendance_records` with date, class ID, and professor ID |
| F4.3 | Professor dashboard must display real-time attendance trend widget after marking |
| F4.4 | Professors must be able to view all pending leave requests and approve or reject with one tap |
| F4.5 | Student follow-up must allow professors to flag a student, add a structured note, and track flag status |
| F4.6 | Notice publishing must create a DB record in the `notices` table. No RAG indexing is needed — Copilot reads notices directly from the DB on each query |
| F4.7 | Notices must be targetable by `role` and `department` |
| F4.8 | Leave approval action must emit a `notification:push` WebSocket event to the student immediately |

#### Acceptance Criteria
- [ ] Professor marks attendance for a class of 30 students in under 60 seconds
- [ ] Published notice is queryable by Copilot within 10 seconds of publishing
- [ ] Leave approval triggers push notification on student's device within 5 seconds

---

### F5 — Conflict-Aware Scheduling Layer

**Priority:** P0 — Must Ship  
**PS Reference:** Feature 5

#### Description
A unified mobile calendar merging academic timetables with operational events. Includes a Clash Detection algorithm and Smart Slot Suggestions to eliminate double-booking.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| F5.1 | Calendar must display all events for a given date range from `GET /api/calendar/events` |
| F5.2 | Room booking submission must run `clash-detector.ts` server-side before accepting |
| F5.3 | If a clash is detected, system must reject and return 3 smart alternative slot suggestions |
| F5.4 | Smart suggestions must consider room availability, the user's existing academic schedule, and historical patterns |
| F5.5 | Students must be able to view real-time room availability for any room |
| F5.6 | Approved room bookings must auto-create a `calendar_events` record with `is_locked = true` |
| F5.7 | Calendar must visually differentiate event types: `class` (blue), `event` (purple), `room_booking` (green) |

#### Acceptance Criteria
- [ ] Booking an already-booked room returns a clash warning with 3 alternatives within 2 seconds
- [ ] Approved booking appears on the calendar immediately after confirmation
- [ ] Smart suggestions are clearly relevant to the user's existing timetable

---

### F6 — Analytics & Decision Intelligence

**Priority:** P0 — Must Ship  
**PS Reference:** Feature 6

#### Description
A high-level mobile dashboard for campus leadership surfacing operational trends from all platform modules, enabling proactive rather than reactive management.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| F6.1 | Admin must see: approval delay metrics (avg time per stage, bottleneck identification) |
| F6.2 | Admin must see: issue resolution statistics (open count, age distribution, resolution rate) |
| F6.3 | Admin must see: attendance trend aggregates across departments |
| F6.4 | Analytics data must be served from `GET /api/analytics/*` endpoints |
| F6.5 | All charts must render with seeded data for the demo (real structure, seeded values) |
| F6.6 | Admin must be able to send direct nudge notifications to flagged bottleneck users from the dashboard |
| F6.7 | Analytics must refresh at least every 60 seconds via cron-based recomputation |

#### Acceptance Criteria
- [ ] Admin can identify the approval bottleneck stage within 10 seconds of opening the dashboard
- [ ] Issue density is visualized with actionable breakdown (building, category, recurrence)
- [ ] Dashboard loads without whitespace — all charts render with live or seeded data

---

### F7 — Mobile Resolution & Support Protocol

**Priority:** P0 — Must Ship  
**PS Reference:** Feature 7

#### Description
A structured system for reporting campus issues (IT failures, facility maintenance). Users capture photo evidence via phone camera, stored in Cloudinary. Support teams receive prioritized tickets. Leadership sees a live issue heatmap.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| F7.1 | Users must be able to report an issue with: title, description, category, building location, and an optional photo |
| F7.2 | Photo upload must flow: mobile → backend (Multer) → Cloudinary. Mobile must never receive Cloudinary credentials |
| F7.3 | Issue submission must emit `issue:created` and `heatmap:update` WebSocket events within 2 seconds |
| F7.4 | Heatmap must display campus issue density as a real-time map overlay |
| F7.5 | Issues must be categorized: `it` | `facility` | `academic` | `other` |
| F7.6 | Issues must be prioritized: `low` | `medium` | `high` | `critical` based on category and recurrence |
| F7.7 | Support staff must receive a push notification for new issues assigned to their team |
| F7.8 | Support staff must be able to update issue status: `open` → `in_progress` → `resolved` |
| F7.9 | Photo size limit: 10MB enforced by Multer config |

#### Acceptance Criteria
- [ ] Submitting an issue with a photo results in a heatmap dot appearing within 3 seconds (live WebSocket demo moment)
- [ ] Photo renders correctly when viewed from the issue detail screen
- [ ] Support team receives push notification within 5 seconds of submission

#### WF Enhancement — WF#2: Live Heatmap Demo Moment
The heatmap dot appearing in real-time (zero-latency WebSocket) after issue submission is the signature self-demonstrating moment for this feature — no explanation required.

---

### F8 — Extensible Super App Architecture _(Brownie Point)_

**Priority:** P1 — Ship for Brownie  
**PS Reference:** Brownie Feature B1

#### Description
A **"Mock-Platform" iframe-based micro-frontend architecture**. The Aether Host Shell (web dashboard) dynamically loads external mini-apps inside sandboxed iframes. Cross-origin communication is handled via `aether-bridge.js` (a lightweight `window.postMessage` SDK). A Developer Portal lets students submit mini-app URLs, which are automatically audited by a Grok API security scan before an admin approves them. Approved apps immediately appear in the dashboard — no rebuild required.

> ⚠️ **IMPLEMENTATION NOTE — CRITICAL:** This feature is implemented as a **web-based host shell** (not the React Native mobile app). It uses iframes + `window.postMessage`, NOT React Native WebView + HTTP headers. The architecture is: (1) Host Shell fetches plugin registry from backend, (2) renders iframe for the selected plugin URL, (3) `aether-bridge.js` pushes scoped user data (name, role) to the iframe via `postMessage`, (4) the mini-app reads only what the shell "pushes" to it — no direct API access.

#### Architecture Components

| Component | Description |
|-----------|-------------|
| **Host Shell** | Web dashboard (React + Express/Node) that renders plugin icons and loads mini-apps in sandboxed iframes |
| **aether-bridge.js** | Mini SDK provided to plugin developers. Uses `window.postMessage` for bidirectional Host↔MiniApp communication |
| **Developer Portal** | Web UI within Aether where developers register mini-apps by providing Title, Description, Category, and Deployment URL |
| **AI Security Auditor** | On submission, backend calls Grok API with the app metadata + declared permissions. Grok generates a "Security Clearance Certificate" (JSON/PDF-style report) |
| **Plugin Registry** | MongoDB collection (or Neon `plugins` table) storing: name, slug, deployment_url, category, status (`pending`/`approved`/`rejected`), grok_audit_report |
| **Dynamic Injection** | On admin approval, registry updates; Host Shell re-fetches and renders the new plugin icon in real-time — simulating a "Live Store Update" |

#### User Flow

```
Step 1 — Submission:
  Student navigates to Developer Portal
  → Fills form: Title="Canteen Tracker", Category="Food", URL="https://canteen.vercel.app"
  → Clicks "Submit for Review"

Step 2 — AI Security Audit (automated, triggered on submit):
  Backend calls Grok API with: { appName, deploymentUrl, category, permissions: ["read:user.name", "read:user.role"] }
  → Grok returns structured Security Clearance Certificate:
    { riskLevel: "LOW", findings: [...], recommendation: "APPROVE", compliance: "Data Privacy OK" }
  → Certificate stored in plugin registry
  → Shown to admin with "scanning" animation + PDF-style report UI

Step 3 — Admin Approval:
  Admin reviews Grok security report in Developer Portal
  → Clicks "Approve" → plugin status = "approved" in registry

Step 4 — Live Deployment:
  Student Dashboard re-fetches plugin registry
  → "Canteen Tracker" icon appears immediately in Mini Apps section
  → Student taps icon → iframe loads https://canteen.vercel.app inside Host Shell
  → aether-bridge.js pushes { userName: "Priyank", role: "student" } to iframe via postMessage
  → Mini-app displays: "Welcome, Priyank!" — proving scoped data access
```

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| F8.1 | Plugin registry must be stored in DB (Neon `plugins` table) with: name, slug, deployment_url, category, status, grok_audit_report (JSONB) |
| F8.2 | Host Shell must fetch active plugins from `GET /api/plugins` on dashboard load and render icons dynamically |
| F8.3 | Each approved plugin must appear as an icon in the "Mini Apps" section of the student dashboard |
| F8.4 | Clicking a plugin icon must open the plugin's `deployment_url` in a sandboxed iframe within the Host Shell |
| F8.5 | `aether-bridge.js` must use `window.postMessage` to push `{ userName, role, department }` from Shell to iframe (scoped data only — no auth tokens sent) |
| F8.6 | Developer Portal must accept: Title, Description, Category, Deployment URL as form inputs |
| F8.7 | On form submission, backend must call Grok API with app metadata and declared permissions to generate a Security Clearance Certificate |
| F8.8 | The Security Clearance Certificate UI must show a professional report (JSON or card style) with: Risk Level, Findings list, Recommendation, Compliance status. Include a "scanning" animation while Grok responds |
| F8.9 | Admin must be able to Approve or Reject a plugin after reviewing the Grok audit report |
| F8.10 | On approval, the student dashboard must reflect the new plugin icon within 5 seconds (real-time via WebSocket `plugin:approved` event or polling) |
| F8.11 | Demo Canteen Tracker app must be deployed at a real URL (e.g., Vercel) and implement the `aether-bridge.js` SDK to greet the user by name |
| F8.12 | Developer documentation at `docs/developer-portal.md` must explain how to implement `aether-bridge.js` in a mini-app |

#### Acceptance Criteria
- [ ] Submitting Canteen Tracker URL triggers a Grok security audit report that renders with animation within 10 seconds
- [ ] Admin approves → Canteen Tracker icon appears on dashboard within 5 seconds
- [ ] Clicking icon loads the Canteen Tracker URL in an iframe that displays the logged-in user's real name
- [ ] No auth tokens are passed to the iframe — only scoped data via `postMessage`
- [ ] aether-bridge.js SDK is a standalone file deliverable to any mini-app developer

#### WF Enhancements Applied
- **WF#13 — Live Plugin Install:** Grok audit + admin approval + live icon injection is the full tangible demo — architecture is visible, not just described
- **WF#14 — Developer Portal:** "Any developer in this room can submit their app and get a Grok security clearance in 10 seconds" — reframes Aether as regulated infrastructure

---

### F9 — Financial Settlement Gateway _(Brownie Point)_

**Priority:** P1 — Ship for Brownie  
**PS Reference:** Brownie Feature B2

#### Description
A secure clearinghouse integration allowing students to pay library fines, canteen bills, or lab dues via UPI or card through Razorpay (test mode).

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| F9.1 | Students must see an itemized list of pending dues from `GET /api/finance/dues` |
| F9.2 | Students must be able to initiate payment for any due via `POST /api/finance/pay/:dueId` |
| F9.3 | Backend must create a Razorpay order and return `orderId` to mobile |
| F9.4 | Mobile must open the Razorpay checkout UI with the `orderId` |
| F9.5 | On payment success, mobile must call `POST /api/finance/verify` with payment signature |
| F9.6 | Backend must verify Razorpay HMAC signature before marking due as paid |
| F9.7 | Paid dues must be removed from the dashboard finance badge count |
| F9.8 | Due types must include: `library`, `canteen`, `lab` |
| F9.9 | Test mode credentials must be used throughout — no real money is charged |

#### Acceptance Criteria
- [ ] Student completes a payment flow end-to-end in test mode
- [ ] Backend correctly verifies signature and marks due as paid in the DB
- [ ] Dashboard finance badge clears after payment without manual refresh

---

### F10 — Campus Karma Score

**Priority:** P2 — Ship for Polish  
**PS Reference:** WF#10 (brainstorming enhancement)

#### Description
A gamified civic responsibility score. Students earn karma for positive campus behaviors. High-karma students receive booking priority.

#### Functional Requirements

| ID | Requirement |
|----|-------------|
| F10.1 | Karma events must be logged in `karma_events` with event_type and points |
| F10.2 | Earning actions: issue reported (+10 pts), class attended (+5 pts), room returned early (+15 pts) |
| F10.3 | Karma score = sum of all `karma_events.points` for a user |
| F10.4 | Student dashboard must display current score as a gold chip widget |
| F10.5 | A karma leaderboard must be accessible via `GET /api/karma/leaderboard` |
| F10.6 | Room booking priority must factor karma score for tie-breaking |

#### Acceptance Criteria
- [ ] Karma score chip is visible on student dashboard with a non-zero seed score
- [ ] Karma breakdown screen shows which actions contributed which points

---

## 7. Non-Functional Requirements

### NFR1 — Performance

| ID | Requirement |
|----|-------------|
| NFR1.1 | API response time (P95): ≤ 500ms for non-AI endpoints |
| NFR1.2 | AI Copilot text response: ≤ 5 seconds end-to-end (DB context fetch + Grok API call + translate) |
| NFR1.3 | WebSocket event delivery: ≤ 2 seconds from trigger to client receipt |
| NFR1.4 | Dashboard initial load: ≤ 3 seconds on campus WiFi |
| NFR1.5 | Image upload (10MB): ≤ 8 seconds Cloudinary round-trip |

### NFR2 — Reliability & Availability

| ID | Requirement |
|----|-------------|
| NFR2.1 | Backend must handle demo-scale traffic: 10–50 concurrent users |
| NFR2.2 | WebSocket reconnection must be automatic: `reconnection: true, reconnectionDelay: 1000ms` |
| NFR2.3 | All database operations must use transactions for multi-step flows (payment verification, multi-stage approval) |
| NFR2.4 | Backend must not crash on malformed requests — global error middleware handles all exceptions |

### NFR3 — Security

| ID | Requirement |
|----|-------------|
| NFR3.1 | JWT authentication must be validated on every protected API request |
| NFR3.2 | Session tokens must be stored in `expo-secure-store` — never `AsyncStorage` |
| NFR3.3 | Razorpay payment signature must be verified server-side before any payment is recorded |
| NFR3.4 | Cloudinary API secrets must never be exposed to the mobile client |
| NFR3.5 | Socket.IO connections require valid Neon Auth token in handshake data |
| NFR3.6 | Role-based access enforced server-side — mobile UI is decorative, server is the authority |

### NFR4 — Scalability

| ID | Requirement |
|----|-------------|
| NFR4.1 | Plugin architecture must support new plugins without core app redeployment |
| NFR4.2 | Database schema must support multi-department, multi-campus isolation via `department` fields |
| NFR4.3 | Plugin registry must support real-time injection — new approved plugins appear in the dashboard without app restart |

### NFR5 — Accessibility & Inclusivity

| ID | Requirement |
|----|-------------|
| NFR5.1 | Copilot must support output in at least 3 Indian languages: Hindi, Tamil, Marathi |
| NFR5.2 | All screens must maintain readable contrast ratios on dark backgrounds (WCAG AA) |
| NFR5.3 | Minimum body text size: 13sp |

### NFR6 — Free-Tier Compliance

| ID | Requirement |
|----|-------------|
| NFR6.1 | All external services must operate on free tiers — no paid prerequisites |
| NFR6.2 | Image storage ≤ 25GB (Cloudinary free) |
| NFR6.3 | Email delivery ≤ 3,000/month (Resend free) |
| NFR6.4 | Neon PostgreSQL ≤ 512MB storage |

---

## 8. Technical Constraints & Architecture Context

### Platform Decisions (Non-Negotiable)

| Layer | Technology | Constraint |
|-------|-----------|------------|
| Mobile | React Native 0.73+ + Expo Go SDK 50 | Expo Go compatible only — no native builds, no `prebuild` |
| Mobile Routing | Expo Router v3 | File-based routing: `(auth)`, `(student)`, `(professor)`, `(admin)` groups |
| Mobile Styling | React Native StyleSheet only | **NO Tailwind CSS.** Design tokens in `constants/colors.ts`, `typography.ts`, `spacing.ts` |
| State | Zustand 4.x | All stores in `store/` following the documented pattern |
| HTTP | Axios via `api.ts` | **No raw `fetch()` in components.** All calls through `services/` |
| Backend | Node.js 20 + Express 4 + TypeScript 5 | Controller/Service pattern strictly enforced |
| Database | Neon PostgreSQL + Drizzle ORM | No raw SQL in application code (migrations only) |
| Auth | Neon Auth (managed) | JWT sessions; role checked server-side only |
| Real-time | Socket.IO 4.x | Namespace `/`, rooms: `user:{id}` and `request:{id}` |
| AI (Copilot) | Grok (xAI) — direct API calls only | **NO RAG, NO Pinecone, NO LangChain.** DB context injected into Grok prompt. Translation via LibreTranslate after Grok response. |
| Super App AI | Grok (xAI) — security audit calls | Grok generates Security Clearance Certificate for each mini-app submission |
| Image Storage | Cloudinary (server-side upload) | Mobile sends multipart to backend, never directly to Cloudinary |
| Payments | Razorpay Test Mode | HMAC signature verification mandatory on backend |
| Push Notifications | Firebase FCM via Expo | Push tokens managed server-side |

### Design System

```
Background:       #0F0E17
Surface:          #1A1A2E
Surface Elevated: #16213E
Primary:          #6C63FF
Secondary:        #FF6584
Text Primary:     #FFFFFE
Text Secondary:   #A7A9BE
Success:          #2CB67D
Warning:          #FF8906
Error:            #E53170
Karma Gold:       #FFD700
```

**Typography:** Inter (Regular, Medium, SemiBold, Bold)  
**Spacing tokens:** `xs: 4 · sm: 8 · md: 16 · lg: 24 · xl: 32 · xxl: 48`

---

## 9. MVP Scope & Prioritization

### Build Tiers (24-Hour Hackathon Reality)

| Tier | Meaning |
|------|---------|
| 🟢 **Build for Real** | Fully functional, live data, works under judge scrutiny |
| 🟡 **Smart Fake** | Functional UI, pre-seeded data — feels real, zero risk |
| 🔵 **Concept / Roadmap** | Mentioned in pitch, no interactive demo |

### Prioritization Table

| Feature | PS Ref | Tier | Demo Window |
|---------|--------|------|-------------|
| Role-Aware Dashboard | F1 | 🟢 Real | 0:00–0:30 |
| AI Copilot (text + Hindi + notice loop) | F3 | 🟢 Real | 0:30–1:15 |
| Faculty Coordination Workspace | F4 | 🟢 Real | 0:30–1:15 + 2:15–2:45 |
| Workflow + Approvals Engine (Swiggy Bar) | F2 | 🟢 Real | 1:15–2:15 |
| Conflict-Aware Scheduling + Clash Detection | F5 | 🟢 Real | 1:15–2:15 |
| Issue Reporting + Camera + Live Heatmap | F7 | 🟢 Real | 1:15–2:15 |
| Analytics Dashboard | F6 | 🟡 Smart Fake | 1:15–2:15 |
| PYQ Scraper | — | 🟢 Real | 2:15–2:45 |
| Financial Settlement (UPI test) | F9 | 🟢 Real | 2:15–2:45 |
| Super App + Live Plugin Install | F8 | 🟢 Real | 2:45–3:30 |
| Developer Portal | WF#14 | 🟡 Smart Fake | 2:45–3:30 |
| Karma Score Widget | F10 | 🟡 Smart Fake | 0:00–0:30 |
| Copilot Memory (proactive alert) | WF#4 | 🟡 Smart Fake | 0:30–1:15 |
| Ghost Mode (predictive auto-approval) | WF#7 | 🔵 Roadmap | Pitch slide only |

### 24-Hour Sprint Blueprint

| Sprint | Hours | Focus |
|--------|-------|-------|
| **Sprint 0** | H0–1 | Monorepo scaffold, DB setup, seed data, env files |
| **Sprint 1** | H1–4 | Auth, role-aware dashboards (both roles), FCM push |
| **Sprint 2** | H4–10 | Workflow Engine, Swiggy Bar (WebSocket), Issue+Heatmap, AI Copilot (direct Grok API), Notice→DB→Copilot loop |
| **Sprint 3** | H10–17 | PYQ, Finance+Razorpay, Calendar+Clash, Faculty Workspace, Mother Tongue |
| **Sprint 4** | H17–22 | Super App iframe shell + aether-bridge.js + Grok audit + Developer Portal + Canteen Tracker (Vercel deploy), Karma Score, Admin Analytics |
| **Sprint 5** | H22–24 | Demo dry-runs ×3, crash path fixes, seed data polish, WiFi WebSocket testing |

### Team Split

| Priyank | Harshav |
|---------|---------|
| Frontend: Dashboard, Copilot UI, Heatmap, Calendar, Super App iframe shell, aether-bridge.js, Dev Portal UI, all screens | Backend: Workflow Engine, Auth, Grok API integration, Notifications, Issue System, Payment, Plugin Registry, Grok Security Audit endpoint |

---

## 10. Innovation & Differentiation

### Category Positioning

> **Never say "app." Always say "Campus OS."**

Aether is infrastructure, not a tool. The difference between "we built a campus app" and "we built the operating layer for a university" is the entire pitch.

### USP Matrix (from brainstorming SCAMPER analysis)

| # | USP | Why It Wins |
|---|-----|-------------|
| 1 | **Category Creation** | "Campus OS" vs "campus app" — judges remember category creators, not feature lists |
| 2 | **Behavioral Design** | Karma Score + transparent approval chain = incentive design, not just UX |
| 3 | **India-First Identity** | Hindi Copilot shown first — emotional anchor before clever tech |
| 4 | **Two-Phone Peak Moment** | Approval bar advancing live on two devices = zero-latency claim made undeniably visual |
| 5 | **Autonomous Workflow Intelligence** | Copilot + live workflow state = a named new category: campus intelligence layer |

### Three Hero Demo Moments

**Hero 1 — "The Intelligence Loop"** *(0:30–1:15)*
> Professor publishes a notice → Student asks Copilot in Hindi → Answer comes from the notice just published. The communication silo closes on screen in 30 seconds.

**Hero 2 — "The System Is Alive"** *(1:15–2:15)*
> Two phones simultaneously. Student submits room booking → progress bar advances on their phone as HoD approves on the second phone. Issue submitted → heatmap dot appears live.

**Hero 3 — "The Platform Play"** *(2:45–3:30)*
> Plugin installed live during the demo. Developer Portal shown. *"Any developer in this room today can build on Aether."*

### Demo Opening Sequence

1. Open app live — no words
2. Dashboard appears → *"This is Priyank's Thursday morning."*
3. Ask Copilot in Hindi — first action shown
4. *Then:* "No WhatsApp groups. No physical forms. No lost emails."
5. Continue with full demo script

---

## 11. Success Metrics

### Hackathon Demo Criteria

| Metric | Target |
|--------|--------|
| PS features demonstrated | 7/7 core + 2/2 brownie = 9/9 |
| WF enhancements shown | 8 enhancements (WF#2, 4, 5, 6, 7*, 8, 10, 13, 14) |
| Zero live crashes during 5-minute demo | Required |
| Two-phone real-time validation works | Required |
| Copilot Hindi response on conference WiFi | Required |
| Notice → Copilot DB-context loop under 5 seconds | Required |
| Grok security audit report renders within 10 seconds of plugin submission | Required |

### Technical Health Metrics

| Metric | Target |
|--------|--------|
| API uptime during demo window | 100% |
| WebSocket event delivery latency | < 2 seconds |
| Image upload success rate | > 95% |
| Razorpay test payment success | 100% |

### Product Hypothesis Validation (Post-Hackathon)

| Metric | Hypothesis |
|--------|-----------|
| Time to complete room booking (Aether vs. current) | Days → minutes |
| Faculty attendance marking time | 15–20 min → < 2 min |
| Issue resolution transparency | Students know status at all times |
| Student Copilot engagement | > 3 queries/session average |

---

## 12. Roadmap & Future Considerations

### Phase 2 — Depth (Month 1–2)

- **Ghost Mode / Predictive Auto-Approval:** System learns patterns → pre-approves routine requests (WF#7)
- **Full UI Internationalization:** Complete app UI in Hindi/regional languages (not just Copilot)
- **Academic Grade Integration:** Copilot answers questions about grade status and missing assignments
- **Advanced Karma Mechanics:** Karma decay, team karma, department-level leaderboards

### Phase 3 — Scale (Month 3–6)

- **Multi-Campus Support:** Aether deployed across multiple universities under one platform
- **Developer Ecosystem:** Plugin marketplace publicly launched; developers publish without admin intervention
- **DSpace Universal Adapter:** Configurable scraper for any university's document repository
- **Native Admin Analytics App:** Real-time drill-down and mobile-first decision tooling for leadership

### Phase 4 — Platform Expansion (Month 6+)

- **Hospital OS Mode:** Generalize Workflow Engine for hospital approvals and patient intake
- **Government Campus OS:** Deploy at IITs / NITs / government colleges
- **Enterprise API:** Sell Aether's Workflow Engine as a headless API product for institutional workflows
- **Marketplace:** Aether Plugin Marketplace where approved developers monetize campus mini-apps

### Known Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Conference WiFi blocks WebSocket | Medium | High | Test Socket.IO polling fallback; bring mobile hotspot |
| Grok API rate limit during demo | Low | Critical | Cache Copilot + audit responses; have JSON mock fallbacks prepared for both |
| Grok audit response too slow | Low | Medium | Set 15s timeout; show "scanning" animation while waiting — formats the delay as a feature |
| Expo Go incompatible package added | Medium | High | Check expo.dev/go before any new package install |
| LibreTranslate public endpoint down | Medium | High | Fallback to Google Cloud Translate free tier |
| Canteen Tracker Vercel deploy unreachable | Low | High | Host a local fallback on `localhost` as backup iframe target |

---

## Appendix A — API Surface Summary

**Total endpoints:** 43 across 13 modules  
**Modules:** `auth` · `dashboard` · `workflow` · `notices` · `copilot` · `attendance` · `issues` · `calendar` · `pyq` · `finance` · `analytics` · `karma` · `plugins`

**WebSocket Events (Server→Client):**
`approval:updated` · `issue:created` · `heatmap:update` · `notice:new` · `notification:push` · `attendance:updated`

**WebSocket Events (Client→Server):**
`join:user` · `join:room`

---

## Appendix B — External Service Dependencies

| Service | Purpose | Free Tier Limit |
|---------|---------|-----------------|
| Neon PostgreSQL | Primary database | 512MB |
| Neon Auth | Authentication | Included with Neon |
| Firebase FCM | Push notifications | Always free |
| Cloudinary | Image storage | 25GB |
| Grok (xAI) | LLM inference (Copilot + Security Audit) | Generous free tier — no vector/embedding usage |
| Razorpay | Payment processing | Test mode free |
| Resend | Email delivery | 3,000/month |
| LibreTranslate | Language translation | Self-hosted or public |
| DSpace REST API | PYQ paper scraper | Open access |

---

*PRD Version 1.0.0 — Finalized 2026-04-18*  
*Authors: Priyank & Harshav | SEhack 2026*  
*Status: Ready for Development*
