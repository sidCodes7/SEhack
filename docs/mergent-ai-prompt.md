# Aether — Full Build Prompt for Autonomous AI Agent

> **Purpose:** This document is a self-contained prompt for an AI coding agent (e.g., Mergent AI) to build the **complete Aether Campus Operating System** from scratch — backend, mobile frontend, super app, and all integrations.

---

## 1. WHAT YOU ARE BUILDING

**Aether** is a modular, role-based **Campus Operating System** — a mobile-first platform that unifies academic, administrative, and social workflows for Indian universities. It is NOT an app — it is infrastructure.

**Tagline:** _"Above the chaos of campus — Aether."_

### Core Capabilities
1. **Role-Aware Dashboards** — Student, Professor, Admin each see personalized widgets
2. **Workflow & Approvals Engine** — Digital Chain of Responsibility (HoD → Stucco → Dean) with Swiggy-style real-time progress tracking
3. **AI Copilot** — Grok-powered assistant with DB-injected context, Hindi/regional language support, proactive alerts
4. **Faculty Workspace** — Attendance marking (30 students < 60s), leave approvals, notice publishing, student follow-ups
5. **Conflict-Aware Scheduling** — Calendar with clash detection + smart slot suggestions
6. **Analytics Dashboard** — Approval bottlenecks, issue resolution rates, attendance trends
7. **Issue Reporting + Live Heatmap** — Camera-based reporting, Cloudinary uploads, real-time WebSocket heatmap
8. **Finance Gateway** — Razorpay test-mode dues payment (library, canteen, lab fines)
9. **PYQ Discovery** — Previous year question paper search + download
10. **Super App Platform** — Iframe-based plugin architecture with Grok AI security audit, Developer Portal, aether-bridge.js SDK
11. **Karma Score** — Gamified civic responsibility system

---

## 2. TECHNOLOGY STACK (Non-Negotiable)

| Layer | Technology | Version |
|-------|-----------|---------|
| **Mobile** | React Native + Expo Go | SDK 50, Expo Router v3 |
| **Mobile Styling** | `StyleSheet.create()` ONLY | **NO Tailwind CSS** |
| **State Management** | Zustand | 4.x |
| **HTTP Client** | Axios (via `services/api.ts`) | **Never use `fetch()` directly** |
| **Backend** | Node.js + Express + TypeScript | Node 20 LTS, Express 4, TS 5 |
| **Database** | Neon PostgreSQL + Drizzle ORM | Free tier |
| **Auth** | Neon Auth (managed JWT sessions) | Token in `expo-secure-store` |
| **Real-time** | Socket.IO | 4.x |
| **AI/LLM** | Grok (xAI) — Direct API calls | **NO RAG, NO Pinecone, NO LangChain** |
| **Translation** | LibreTranslate | Called AFTER Grok response |
| **Image Storage** | Cloudinary | Server-side upload via Multer |
| **Payments** | Razorpay Test Mode | HMAC signature verification on backend |
| **Push Notifications** | Firebase FCM via Expo | Free |
| **Email** | Resend | Free tier (3,000/month) |
| **Super App** | Vite + React (web) | Iframe + postMessage architecture |

### Free-Tier Only Rule
All external services MUST operate on free tiers. No paid prerequisites.

---

## 3. PROJECT STRUCTURE

```
aether/
├── apps/
│   ├── mobile/                          # React Native (Expo Go)
│   │   ├── app/                         # Expo Router screens (file-based routing)
│   │   │   ├── _layout.tsx              # Root layout: auth check, redirect
│   │   │   ├── (auth)/
│   │   │   │   ├── login.tsx
│   │   │   │   └── role-select.tsx
│   │   │   ├── (student)/
│   │   │   │   ├── _layout.tsx          # Student tab layout
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── karma.tsx
│   │   │   │   ├── pyq/index.tsx
│   │   │   │   ├── finance/index.tsx
│   │   │   │   ├── finance/payment.tsx
│   │   │   │   ├── issues/report.tsx
│   │   │   │   ├── issues/heatmap.tsx
│   │   │   │   ├── bookings/request.tsx
│   │   │   │   ├── bookings/status.tsx
│   │   │   │   ├── calendar/index.tsx
│   │   │   │   └── copilot/index.tsx
│   │   │   ├── (professor)/
│   │   │   │   ├── _layout.tsx
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── attendance/index.tsx
│   │   │   │   ├── leave-approvals/index.tsx
│   │   │   │   ├── follow-ups/index.tsx
│   │   │   │   └── notices/index.tsx
│   │   │   └── (admin)/
│   │   │       └── analytics.tsx
│   │   ├── components/
│   │   │   ├── common/                  # Button, Card, Badge, Avatar, LoadingSpinner, NotificationBanner
│   │   │   ├── dashboard/               # KarmaScoreWidget, NextClassWidget, FinanceDueWidget, QuickActionsWidget
│   │   │   ├── approvals/               # ApprovalProgressBar (Swiggy-style), ApprovalCard
│   │   │   ├── copilot/                 # CopilotFAB, CopilotChat, LanguageToggle
│   │   │   └── heatmap/                 # CampusHeatmap
│   │   ├── constants/                   # colors.ts, typography.ts, spacing.ts
│   │   ├── hooks/                       # useAuth, useWebSocket, useNotifications, useCopilot
│   │   ├── services/                    # api.ts + 12 service files (ALL API calls go here)
│   │   ├── store/                       # auth.store.ts, notifications.store.ts, copilot.store.ts
│   │   ├── types/                       # user, approval, issue, copilot types
│   │   ├── utils/                       # format.ts, validation.ts, clash-detection.ts
│   │   └── styles/global.ts
│   │
│   ├── backend/                         # Node.js Express API
│   │   ├── src/
│   │   │   ├── app.ts                   # Express app setup (ALL routes pre-wired)
│   │   │   ├── server.ts                # Entry point
│   │   │   ├── modules/
│   │   │   │   ├── auth/                # auth.controller.ts, auth.service.ts, auth.routes.ts
│   │   │   │   ├── users/               # users.controller.ts, users.service.ts, users.routes.ts
│   │   │   │   ├── dashboard/           # dashboard.controller.ts, dashboard.service.ts, dashboard.routes.ts
│   │   │   │   ├── workflow/            # workflow.controller.ts, workflow.service.ts, workflow.routes.ts, approver-resolver.ts
│   │   │   │   ├── copilot/             # copilot.controller.ts, copilot.service.ts, copilot.routes.ts, context-builder.ts, translation.service.ts
│   │   │   │   ├── notices/             # notices.controller.ts, notices.service.ts, notices.routes.ts
│   │   │   │   ├── attendance/          # attendance.controller.ts, attendance.service.ts, attendance.routes.ts
│   │   │   │   ├── issues/              # issues.controller.ts, issues.service.ts, issues.routes.ts, heatmap.service.ts
│   │   │   │   ├── calendar/            # calendar.controller.ts, calendar.service.ts, calendar.routes.ts, clash-detector.ts
│   │   │   │   ├── pyq/                 # pyq.controller.ts, pyq.service.ts, pyq.routes.ts
│   │   │   │   ├── finance/             # finance.controller.ts, finance.service.ts, finance.routes.ts, payment.service.ts
│   │   │   │   ├── analytics/           # analytics.controller.ts, analytics.service.ts, analytics.routes.ts
│   │   │   │   ├── karma/               # karma.controller.ts, karma.service.ts, karma.routes.ts
│   │   │   │   └── plugins/             # plugins.controller.ts, plugins.service.ts, plugins.routes.ts, grok-auditor.service.ts
│   │   │   └── shared/
│   │   │       ├── db/                  # neon.client.ts, schema.ts, seed.ts, migrations/
│   │   │       ├── websocket/           # ws.server.ts, ws.rooms.ts
│   │   │       ├── storage/             # cloudinary.service.ts
│   │   │       ├── notifications/       # fcm.service.ts
│   │   │       ├── email/               # resend.service.ts
│   │   │       └── middleware/           # auth.middleware.ts, error.middleware.ts, logger.middleware.ts, rate-limit.middleware.ts
│   │   └── package.json
│   │
│   ├── super-app/                       # Vite + React web app (Plugin Host Shell)
│   │   └── src/components/              # HostShell, MiniAppDashboard, IframeContainer, DeveloperPortal, AdminAuditView
│   │
│   └── canteen-tracker/                 # Demo mini-app (HTML+JS)
│       ├── index.html
│       └── app.js
│
├── packages/
│   └── shared-types/                    # Shared TypeScript interfaces (barrel export)
│       └── src/                         # user.ts, approval.ts, issue.ts, copilot.ts, notice.ts, calendar.ts, finance.ts, karma.ts, plugin.ts, analytics.ts, index.ts
│
├── libs/
│   └── aether-bridge/                   # Mini-app SDK
│       ├── aether-bridge.js
│       └── README.md
│
├── docs/
│   ├── project-context.md
│   ├── developer-portal.md
│   └── wireframes/                      # 22 wireframe folders (screen.png + code.html each)
│
├── scripts/                             # start.sh, start.bat, backend.sh, backend.bat
├── package.json                         # Root npm workspaces: ["packages/*", "apps/*"]
└── README.md
```

---

## 4. CRITICAL RULES — NEVER VIOLATE

1. **NO Tailwind CSS.** React Native uses `StyleSheet.create({})` only. Design tokens in `constants/`.
2. **Expo Go ONLY.** No packages requiring native builds or `expo prebuild`.
3. **ALL API calls go through `services/api.ts`.** Never use `fetch()` directly in components.
4. **Env vars in Expo must be prefixed `EXPO_PUBLIC_`**.
5. **Never hardcode API URLs.** Use env vars.
6. **Free-tier services only.**
7. **NO RAG pipeline for Copilot.** No Pinecone, No LangChain, No vector embeddings. DB context injected into Grok prompt.
8. **Never trust mobile for payment confirmation.** Verify `razorpay_signature` on backend.
9. **Cloudinary secrets never exposed to mobile.** Server-side upload only.
10. **UUIDs for all primary keys.** Never auto-increment integers.
11. **All timestamps are `TIMESTAMPTZ`.** Never `TIMESTAMP`.
12. **TypeScript strict mode** everywhere. No `any` — use `unknown` then narrow.
13. **String literal unions for roles**, NOT TypeScript enums.
14. **Token storage:** `expo-secure-store` — NEVER `AsyncStorage`.
15. **Controllers have NO business logic.** All logic in services.
16. **Response format:** `{ success: true, data: payload }` or `{ success: false, error: 'message' }`.

---

## 5. DESIGN SYSTEM

### Color Tokens
```typescript
export const COLORS = {
  primary: '#6C63FF',
  secondary: '#FF6584',
  background: '#0F0E17',
  surface: '#1A1A2E',
  surfaceElevated: '#16213E',
  textPrimary: '#FFFFFE',
  textSecondary: '#A7A9BE',
  success: '#2CB67D',
  warning: '#FF8906',
  error: '#E53170',
  karmaGold: '#FFD700',
};
```

### Spacing Tokens
```typescript
export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
```

### Typography (Inter font family)
```typescript
export const FONTS = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extraBold: 'Inter-ExtraBold',
};
```

### Styling Pattern (ALWAYS follow)
```typescript
import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
});
```

---

## 6. DATABASE SCHEMA (Drizzle ORM + Neon PostgreSQL)

```sql
-- Users & Roles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student','professor','admin','hod','principal','dean')),
  department VARCHAR(100),
  semester INTEGER,
  program VARCHAR(100),
  karma_score INTEGER DEFAULT 0,
  preferred_language VARCHAR(10) DEFAULT 'en',
  fcm_token VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notices
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  target_role VARCHAR(50) DEFAULT 'student',
  department VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Requests
CREATE TABLE workflow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id),
  type VARCHAR(100) NOT NULL,          -- 'room_booking' | 'certificate' | 'leave'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'in_progress' | 'approved' | 'rejected'
  current_stage INTEGER DEFAULT 1,
  total_stages INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval Chain Stages
CREATE TABLE approval_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES workflow_requests(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL,
  approver_id UUID REFERENCES users(id),
  approver_role VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  note TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issues (for heatmap)
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100),              -- 'it' | 'facility' | 'academic' | 'other'
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'open',
  location_x DECIMAL(10,6),
  location_y DECIMAL(10,6),
  building VARCHAR(100),
  image_url VARCHAR(500),
  assigned_team VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID REFERENCES users(id),
  student_id UUID REFERENCES users(id),
  class_id VARCHAR(100) NOT NULL,
  subject VARCHAR(200),
  is_present BOOLEAN NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar / Bookings
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES users(id),
  title VARCHAR(500) NOT NULL,
  type VARCHAR(50),                   -- 'class' | 'event' | 'room_booking'
  room VARCHAR(100),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finance Dues
CREATE TABLE finance_dues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  type VARCHAR(100) NOT NULL,         -- 'library' | 'canteen' | 'lab'
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  razorpay_order_id VARCHAR(200),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Karma Events
CREATE TABLE karma_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(100) NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plugin Registry (Super App)
CREATE TABLE plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  deployment_url VARCHAR(500),
  icon_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  grok_audit_report JSONB,
  is_active BOOLEAN DEFAULT FALSE,
  submitted_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copilot Conversation Memory
CREATE TABLE copilot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  messages JSONB DEFAULT '[]',
  context_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. FULL API CONTRACT

### Auth `/api/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register user |
| POST | `/login` | Login → returns JWT |
| POST | `/logout` | Invalidate session |
| GET | `/me` | Get current user profile |
| PATCH | `/language` | Update preferred language |

### Dashboard `/api/dashboard`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/student` | Student dashboard widgets |
| GET | `/professor` | Professor dashboard widgets |
| GET | `/admin` | Admin analytics overview |

### Workflow `/api/workflow`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/request` | Submit workflow request |
| GET | `/requests` | List my requests with stage status |
| GET | `/requests/:id` | Single request + approval chain |
| GET | `/pending` | Requests pending my approval |
| POST | `/requests/:id/approve` | Approve stage (optional note) |
| POST | `/requests/:id/reject` | Reject with note |

### Notices `/api/notices`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Publish notice (professor only) |
| GET | `/` | List notices (filterable) |
| GET | `/:id` | Single notice |

### Copilot `/api/copilot`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/chat` | Send message → Grok response |
| GET | `/session` | Conversation memory |
| POST | `/proactive` | Rule-based proactive alerts (NO Grok call) |
| GET | `/languages` | List supported languages |

### Attendance `/api/attendance`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/mark` | Bulk mark attendance |
| GET | `/class/:classId` | Class attendance records |
| GET | `/student/:studentId` | Student attendance summary |
| GET | `/trends` | Aggregated trends |

### Issues `/api/issues`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Report issue (multipart: image + data) |
| GET | `/` | List issues (filterable) |
| GET | `/heatmap` | Heatmap data points |
| PATCH | `/:id/status` | Update issue status |

### Calendar `/api/calendar`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/events` | List events for date range |
| GET | `/rooms` | Rooms with availability |
| POST | `/book` | Book slot (runs clash detection) |
| GET | `/clash-check` | Check if slot clashes |
| GET | `/suggestions` | Smart slot suggestions |

### PYQ `/api/pyq`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/papers` | Search/list PYQ papers |
| GET | `/papers/:id` | Paper detail + download URL |
| POST | `/sync` | Trigger DSpace refresh (admin) |

### Finance `/api/finance`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/dues` | List my pending dues |
| POST | `/pay/:dueId` | Initiate Razorpay order |
| POST | `/verify` | Verify Razorpay payment signature |

### Analytics `/api/analytics`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/attendance` | Attendance trend aggregates |
| GET | `/approvals` | Approval delay bottlenecks |
| GET | `/issues` | Issue resolution stats |

### Karma `/api/karma`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/score` | My karma score + breakdown |
| GET | `/leaderboard` | Top karma students |

### Plugins `/api/plugins`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List active plugins |
| GET | `/:slug` | Plugin detail + audit report |
| POST | `/` | Submit new plugin (triggers Grok audit) |
| PATCH | `/:id/approve` | Admin approve |
| PATCH | `/:id/reject` | Admin reject |

---

## 8. WEBSOCKET EVENTS

### Server → Client
| Event | Payload | Trigger |
|-------|---------|---------|
| `approval:updated` | `{ requestId, stage, status, approver }` | Approval stage changes |
| `issue:created` | `{ issueId, location, category }` | New issue submitted |
| `heatmap:update` | `{ points: [{x,y,count}] }` | Issue submitted → heatmap refresh |
| `notice:new` | `{ noticeId, title, targetRole }` | Professor publishes notice |
| `notification:push` | `{ type, message, actionUrl }` | Any user-targeted alert |
| `attendance:updated` | `{ classId, trends }` | Professor marks attendance |
| `plugin:approved` | `{ pluginId, slug }` | Admin approves plugin |

### Client → Server
| Event | Payload |
|-------|---------|
| `join:user` | `{ userId, role }` |
| `join:room` | `{ requestId }` |

### WebSocket Architecture
- Namespace: `/` (default)
- Rooms: `user:{userId}` and `request:{requestId}`
- Auth: Socket connection requires JWT in `auth.token` handshake
- Reconnection: `reconnection: true, reconnectionDelay: 1000`

---

## 9. BACKEND MODULE PATTERNS

### Controller Pattern (HTTP layer only, NO business logic)
```typescript
export const workflowController = {
  getMyRequests: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const requests = await workflowService.getRequestsByUser(req.user!.id);
      res.json({ success: true, data: requests });
    } catch (error) {
      next(error);
    }
  },
};
```

### Service Pattern (ALL business logic here)
```typescript
export const workflowService = {
  createRequest: async (requesterId: string, type: string, metadata: Record<string, unknown>) => {
    // 1. Resolve approval chain
    // 2. Create workflow_request
    // 3. Create approval_stages
    // 4. Emit WebSocket event
    // 5. Return created request
  },
};
```

### Route Pattern
```typescript
const router = Router();
router.post('/request', workflowController.createRequest);
router.get('/requests', workflowController.getMyRequests);
export default router;
```

### `app.ts` — All routes pre-wired
```typescript
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

---

## 10. AI COPILOT IMPLEMENTATION (CRITICAL)

> **⚠️ NO RAG PIPELINE. NO Pinecone. NO LangChain. NO vector embeddings.**

### How It Works
1. `context-builder.ts` fetches from Neon PostgreSQL:
   - Last 10 notices for user's department
   - User's pending workflow requests
   - User's outstanding finance dues
   - User profile (name, role, department, karma_score, preferred_language)

2. Compose Grok prompt:
```
System: You are Aether Copilot, the campus AI assistant.
Context:
  - Recent Notices: [DB-fetched notices as text]
  - User: [name, role, department, karma_score]
  - Pending Requests: [workflow_requests list]
  - Finance Dues: [dues list]
User Message: [student query]
Instruction: Answer concisely. Provide 2-3 actionable next steps.
```

3. Call Grok API (`POST https://api.x.ai/v1/chat/completions`) with `XAI_API_KEY`

4. If `preferred_language !== 'en'` → call LibreTranslate AFTER Grok returns

5. Proactive alerts (`GET /api/copilot/proactive`):
   - **Deterministic DB queries ONLY — no Grok call**
   - Check pending workflow_requests, pending finance_dues, upcoming deadlines
   - Return structured alert array

### Supported Languages
`en`, `hi` (Hindi), `ta` (Tamil), `mr` (Marathi), `te` (Telugu)

---

## 11. SUPER APP ARCHITECTURE

> **⚠️ This is a WEB-BASED host shell. NOT React Native WebView.**

### Components
1. **Host Shell** (`apps/super-app/`) — Vite + React web dashboard
2. **aether-bridge.js** (`libs/aether-bridge/`) — PostMessage SDK for mini-apps
3. **Developer Portal** — Form to submit mini-apps → triggers Grok security audit
4. **Admin Audit View** — Review Grok Security Clearance Certificates → Approve/Reject
5. **Canteen Tracker** (`apps/canteen-tracker/`) — Demo mini-app

### Plugin Flow
1. Developer submits app via Developer Portal form
2. Backend calls Grok API to generate Security Clearance Certificate
3. Admin reviews certificate → Approves/Rejects
4. On approval → plugin appears in Mini Apps grid via WebSocket `plugin:approved`
5. User clicks plugin → iframe loads `deployment_url` with `sandbox="allow-scripts allow-same-origin"`
6. Host Shell sends: `postMessage({ type: 'AETHER_INIT', payload: { userName, role, department } })`
7. Mini-app reads via `AetherBridge.onReady(callback)`

### Security
- **NO auth tokens passed to iframes**
- Only scoped data: `{ userName, role, department }`

### aether-bridge.js
```javascript
const AetherBridge = {
  user: null,
  _readyCallbacks: [],
  onReady(callback) {
    if (this.user) { callback(this.user); return; }
    this._readyCallbacks.push(callback);
    window.addEventListener('message', (event) => {
      if (event.data.type === 'AETHER_INIT') {
        this.user = event.data.payload;
        this._readyCallbacks.forEach(cb => cb(this.user));
      }
    });
  },
  sendToHost(type, payload) {
    window.parent.postMessage({ type, payload }, '*');
  },
};
```

---

## 12. PAYMENT FLOW (Razorpay)

```
Mobile: POST /api/finance/pay/:dueId
  → Backend: Creates Razorpay order → returns orderId
  → Mobile: Opens Razorpay checkout UI with orderId
  → On success: Mobile calls POST /api/finance/verify with { razorpay_order_id, razorpay_payment_id, razorpay_signature }
  → Backend: Verifies HMAC signature → marks due as paid
  → On failure: Show error + retry
```

---

## 13. SEED DATA

Create comprehensive seed data in `shared/db/seed.ts`:
- 5 students (including "Priyank"), 3 professors (including "Harshav"), 1 admin
- All users have password: `aether123`
- Key logins: `priyank@aether.edu` (student), `harshav@aether.edu` (professor), `admin@aether.edu` (admin)
- 6 notices (various departments)
- 4 workflow requests in different stages
- 7 issues with various categories/priorities/locations
- 15+ attendance records
- 6 calendar events (classes, bookings, events)
- 3 finance dues per student (15 total)
- 25 karma events for demo scoring
- 1 pre-registered Canteen Tracker plugin (status: 'approved')

---

## 14. ENVIRONMENT VARIABLES

### `apps/mobile/.env`
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_WS_URL=http://localhost:3000
EXPO_PUBLIC_APP_NAME=Aether
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_PLACEHOLDER
```

### `apps/backend/.env`
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/aether?sslmode=require
NEON_AUTH_JWKS_URL=your_neon_auth_jwks_url
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nPLACEHOLDER\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
XAI_API_KEY=xai_PLACEHOLDER
RESEND_API_KEY=re_PLACEHOLDER
RAZORPAY_KEY_ID=rzp_test_PLACEHOLDER
RAZORPAY_KEY_SECRET=PLACEHOLDER
LIBRE_TRANSLATE_URL=https://libretranslate.com
LIBRE_TRANSLATE_API_KEY=PLACEHOLDER
DSPACE_BASE_URL=https://your-university.dspace.edu/rest
ALLOWED_ORIGINS=http://localhost:8081,exp://localhost:8081
```

---

## 15. BUILD ORDER (Dependency-Sequenced)

### Phase 1 — Foundation
1. Root `package.json` with npm workspaces
2. `packages/shared-types/` — All TypeScript interfaces
3. Backend scaffold: `app.ts`, `server.ts`, all middleware
4. DB: `neon.client.ts`, `schema.ts` (Drizzle), run migrations
5. WebSocket: `ws.server.ts`, `ws.rooms.ts`
6. Auth module + Users module + Dashboard module
7. Seed data script

### Phase 2 — Backend Feature Modules
8. Workflow Engine + Approver Resolver + Notices
9. Copilot (Grok direct API + context-builder + translation)
10. Calendar + Clash Detection + Smart Suggestions
11. Issues + Heatmap + Attendance
12. Finance + Razorpay + PYQ
13. Analytics + Karma
14. Plugins + Grok Auditor

### Phase 3 — Mobile Frontend
15. Expo scaffold + Expo Router setup + Design System
16. Auth screens (login, role-select)
17. Student Dashboard + Professor Dashboard + widgets
18. Workflow screens (request, status, ApprovalProgressBar, leave-approvals)
19. Copilot (CopilotChat, CopilotFAB, LanguageToggle)
20. Issues (report, heatmap) + Calendar + Finance + PYQ
21. Faculty workspace (attendance, notices, follow-ups)
22. Admin analytics dashboard

### Phase 4 — Super App
23. `apps/super-app/` — Vite + React web app
24. `libs/aether-bridge/aether-bridge.js`
25. `apps/canteen-tracker/` — Demo mini-app
26. Developer Portal + Admin Audit View

### Phase 5 — Integration & Polish
27. End-to-end WebSocket testing
28. Error states for all API failures
29. Pull-to-refresh on list screens
30. CopilotFAB on every screen
31. Demo dry-runs

---

## 16. KEY USER JOURNEYS TO TEST

### Journey 1 — Room Booking (Two-Phone Demo)
Student submits booking → Swiggy bar Stage 1/3 → Professor approves → Bar advances live → Student gets push notification

### Journey 2 — Notice → Copilot Loop
Professor publishes notice → Student asks Copilot in Hindi → Copilot answers from the notice just published

### Journey 3 — Issue → Live Heatmap
Student reports issue with photo → Heatmap dot appears in real-time via WebSocket

### Journey 4 — Finance Payment
Student sees dues → Pays via Razorpay → Backend verifies HMAC → Due cleared from dashboard

### Journey 5 — Plugin Install (Live Demo Moment)
Developer submits Canteen Tracker → Grok scans → Admin approves → Icon appears live → User opens → "Welcome, Priyank!"

---

## 17. CODING CONVENTIONS

### File Naming
- Mobile screens: `PascalCase.tsx` or `index.tsx` in feature folders
- Backend files: `kebab-case.pattern.ts` (e.g., `workflow.service.ts`)
- Shared types: `camelCase.types.ts`

### Mobile Services Pattern
```typescript
import api from './api';

export const approvalsService = {
  getMyRequests: () => api.get('/workflow/requests'),
  submitRequest: (data: any) => api.post('/workflow/request', data),
  approve: (id: string, note?: string) => api.post(`/workflow/requests/${id}/approve`, { note }),
};
```

### Zustand Store Pattern
```typescript
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  clearAuth: () => set({ user: null, token: null }),
}));
```

### WebSocket Usage in Components
```typescript
const { socket } = useWebSocket();
useEffect(() => {
  socket.on('approval:updated', (data) => { /* update local state */ });
  return () => socket.off('approval:updated');
}, [socket]);
```

---

## 18. QUICK START COMMANDS

```bash
# Install all dependencies (from root)
npm install

# DB setup
cd apps/backend && npx drizzle-kit push

# Seed data
cd apps/backend && npm run seed

# Start backend
cd apps/backend && npm run dev

# Start mobile
cd apps/mobile && npx expo start --go

# Start super-app
cd apps/super-app && npm run dev

# Start everything (Mac/Linux)
chmod +x scripts/start.sh && ./scripts/start.sh

# Start everything (Windows)
scripts\start.bat
```

---

**END OF PROMPT. Build the complete Aether Campus OS following every specification above. Start with Phase 1 (Foundation) and work sequentially through all phases.**
