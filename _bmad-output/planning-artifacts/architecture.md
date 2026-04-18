---
stepsCompleted: [1, 2, 3, 4, 5]
project: Aether — Autonomous Campus Operating System
version: 1.0.0
date: 2026-04-18
inputDocuments:
  - brainstorming-session-2026-04-18-1310.md
  - user-flow-aether.md
  - problem-statement-aether.md
status: ready-for-development
---

# Aether — Architecture Decision Document

> **Tagline:** "Above the chaos of campus — Aether."
> A modular, role-based Campus Operating System unifying academic, administrative, and social workflows.

---

## 1. System Overview

Aether is a **mobile-first, API-driven, role-based platform** with three runtime surfaces:

| Surface | Tech | Purpose |
|---------|------|---------|
| **Mobile App** | React Native (Expo Go) | Student + Professor interface |
| **Backend API** | Node.js (Express) | Business logic, workflow engine, AI orchestration |
| **Database** | Neon (PostgreSQL) | All persistent data + auth |

### Architecture Philosophy

- **Modular monorepo** — each domain is a self-contained module; backend and frontend co-located in one repo with clear separation
- **API-first** — every feature is an API endpoint, enabling the Super App plugin model
- **Free-tier only** — all external services must have a free plan sufficient for demo
- **Deploy last** — DevOps/deployment configured only after all endpoints are verified locally

---

## 2. Folder Structure

```
aether/
├── apps/
│   ├── mobile/                          # React Native (Expo Go)
│   │   ├── app/                         # Expo Router screens
│   │   │   ├── (auth)/
│   │   │   │   ├── login.tsx
│   │   │   │   └── role-select.tsx
│   │   │   ├── (student)/
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── pyq/
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── finance/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── payment.tsx
│   │   │   │   ├── issues/
│   │   │   │   │   ├── report.tsx
│   │   │   │   │   └── heatmap.tsx
│   │   │   │   ├── bookings/
│   │   │   │   │   ├── request.tsx
│   │   │   │   │   └── status.tsx
│   │   │   │   ├── calendar/
│   │   │   │   │   └── index.tsx
│   │   │   │   └── copilot/
│   │   │   │       └── index.tsx
│   │   │   ├── (professor)/
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── attendance/
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── leave-approvals/
│   │   │   │   │   └── index.tsx
│   │   │   │   ├── follow-ups/
│   │   │   │   │   └── index.tsx
│   │   │   │   └── notices/
│   │   │   │       └── index.tsx
│   │   │   ├── (admin)/
│   │   │   │   └── analytics.tsx
│   │   │   └── _layout.tsx
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── NotificationBanner.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── KarmaScoreWidget.tsx
│   │   │   │   ├── NextClassWidget.tsx
│   │   │   │   ├── FinanceDueWidget.tsx
│   │   │   │   └── QuickActionsWidget.tsx
│   │   │   ├── approvals/
│   │   │   │   ├── ApprovalProgressBar.tsx    # Swiggy-style tracker
│   │   │   │   └── ApprovalCard.tsx
│   │   │   ├── copilot/
│   │   │   │   ├── CopilotFAB.tsx             # Floating Action Button
│   │   │   │   ├── CopilotChat.tsx
│   │   │   │   └── LanguageToggle.tsx
│   │   │   ├── heatmap/
│   │   │   │   └── CampusHeatmap.tsx
│   │   │   └── plugins/
│   │   │       ├── PluginShell.tsx
│   │   │       └── PluginRegistry.tsx
│   │   ├── constants/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   └── spacing.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useNotifications.ts
│   │   │   └── useCopilot.ts
│   │   ├── services/
│   │   │   ├── api.ts                         # Axios base client + interceptors
│   │   │   ├── auth.service.ts
│   │   │   ├── approvals.service.ts
│   │   │   ├── copilot.service.ts
│   │   │   ├── issues.service.ts
│   │   │   └── notifications.service.ts
│   │   ├── store/
│   │   │   ├── auth.store.ts                  # Zustand
│   │   │   ├── notifications.store.ts
│   │   │   └── copilot.store.ts
│   │   ├── styles/
│   │   │   └── global.ts                      # StyleSheet design tokens (NO Tailwind)
│   │   ├── types/
│   │   │   ├── user.types.ts
│   │   │   ├── approval.types.ts
│   │   │   ├── issue.types.ts
│   │   │   └── copilot.types.ts
│   │   ├── utils/
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── clash-detection.ts
│   │   ├── app.json
│   │   ├── babel.config.js
│   │   ├── .env                               # Mobile env vars
│   │   └── package.json
│   │
│   └── backend/                              # Node.js Express API
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.routes.ts
│       │   │   │   └── auth.middleware.ts
│       │   │   ├── users/
│       │   │   │   ├── users.controller.ts
│       │   │   │   ├── users.service.ts
│       │   │   │   └── users.routes.ts
│       │   │   ├── dashboard/
│       │   │   │   ├── dashboard.controller.ts
│       │   │   │   ├── dashboard.service.ts
│       │   │   │   └── dashboard.routes.ts
│       │   │   ├── workflow/
│       │   │   │   ├── workflow.controller.ts
│       │   │   │   ├── workflow.service.ts    # Chain of Responsibility engine
│       │   │   │   ├── workflow.routes.ts
│       │   │   │   └── approver-resolver.ts  # Auto-identify HoD→Stucco→Dean
│       │   │   ├── copilot/
│       │   │   │   ├── copilot.controller.ts
│       │   │   │   ├── copilot.service.ts    # Direct Grok API calls — NO RAG pipeline
│       │   │   │   ├── copilot.routes.ts
│       │   │   │   ├── context-builder.ts    # Fetches notices+requests+dues from DB, composes prompt context
│       │   │   │   └── translation.service.ts # Mother tongue support (runs AFTER Grok response)
│       │   │   ├── notices/
│       │   │   │   ├── notices.controller.ts
│       │   │   │   ├── notices.service.ts    # Triggers RAG index refresh
│       │   │   │   └── notices.routes.ts
│       │   │   ├── attendance/
│       │   │   │   ├── attendance.controller.ts
│       │   │   │   ├── attendance.service.ts
│       │   │   │   └── attendance.routes.ts
│       │   │   ├── issues/
│       │   │   │   ├── issues.controller.ts
│       │   │   │   ├── issues.service.ts     # Categorize, prioritize, assign
│       │   │   │   ├── issues.routes.ts
│       │   │   │   └── heatmap.service.ts    # Aggregate to heatmap data
│       │   │   ├── calendar/
│       │   │   │   ├── calendar.controller.ts
│       │   │   │   ├── calendar.service.ts
│       │   │   │   ├── calendar.routes.ts
│       │   │   │   └── clash-detector.ts     # Clash Detection algorithm
│       │   │   ├── pyq/
│       │   │   │   ├── pyq.controller.ts
│       │   │   │   ├── pyq.service.ts        # DSpace scraper + cache
│       │   │   │   └── pyq.routes.ts
│       │   │   ├── finance/
│       │   │   │   ├── finance.controller.ts
│       │   │   │   ├── finance.service.ts
│       │   │   │   ├── finance.routes.ts
│       │   │   │   └── payment.service.ts    # Razorpay integration
│       │   │   ├── analytics/
│       │   │   │   ├── analytics.controller.ts
│       │   │   │   ├── analytics.service.ts
│       │   │   │   └── analytics.routes.ts
│       │   │   ├── karma/
│       │   │   │   ├── karma.controller.ts
│       │   │   │   ├── karma.service.ts      # Score formula engine
│       │   │   │   └── karma.routes.ts
│       │   │   └── plugins/
│       │   │       ├── plugins.controller.ts
│       │   │       ├── plugins.service.ts    # Plugin registry
│       │   │       └── plugins.routes.ts
│       │   ├── shared/
│       │   │   ├── db/
│       │   │   │   ├── neon.client.ts        # Neon PostgreSQL client
│       │   │   │   └── migrations/           # SQL migration files
│       │   │   ├── websocket/
│       │   │   │   ├── ws.server.ts          # Socket.IO server
│       │   │   │   └── ws.rooms.ts           # Room management
│       │   │   ├── storage/
│       │   │   │   └── cloudinary.service.ts # Image upload (free tier)
│       │   │   ├── notifications/
│       │   │   │   └── fcm.service.ts        # Firebase Cloud Messaging
│       │   │   ├── email/
│       │   │   │   └── resend.service.ts     # Resend (free tier)
│       │   │   └── middleware/
│       │   │       ├── auth.middleware.ts
│       │   │       ├── rate-limit.middleware.ts
│       │   │       ├── error.middleware.ts
│       │   │       └── logger.middleware.ts
│       │   ├── app.ts                        # Express app setup
│       │   └── server.ts                     # Entry point
│       ├── .env                              # Backend env vars
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared-types/                        # Shared TypeScript types (mobile + backend)
│       ├── src/
│       │   ├── user.ts
│       │   ├── approval.ts
│       │   ├── issue.ts
│       │   └── copilot.ts
│       └── package.json
│
├── docs/
│   ├── project-context.md
│   ├── api-spec.md
│   └── developer-portal.md               # Super App plugin developer guide
│
├── scripts/
│   ├── start.sh                          # Mac/Linux start script
│   ├── start.bat                         # Windows start script
│   ├── backend.sh
│   └── backend.bat
│
├── .gitignore
├── package.json                          # Root workspace (npm workspaces)
└── README.md
```

---

## 3. Technology Stack

### Frontend (Mobile)

| Concern | Technology | Version | Reason |
|---------|-----------|---------|--------|
| Framework | React Native | 0.73+ | Cross-platform iOS/Android |
| Dev Runtime | Expo Go | SDK 50 | Fast iteration, no native builds |
| Routing | Expo Router | v3 | File-based routing |
| State Management | Zustand | 4.x | Lightweight, no boilerplate |
| HTTP Client | Axios | 1.x | Interceptors for auth tokens |
| WebSocket | Socket.IO Client | 4.x | Real-time approval + heatmap |
| Maps | React Native Maps | 1.x | Campus heatmap (free) |
| Camera | Expo Camera | latest | Issue photo capture |
| Notifications | Expo Notifications | latest | FCM push via Expo |
| Image Upload | Expo Image Picker | latest | Issue reporting |
| Styling | React Native StyleSheet | built-in | **NO Tailwind — vanilla RN styles** |

### Backend (API)

| Concern | Technology | Version | Reason |
|---------|-----------|---------|--------|
| Runtime | Node.js | 20 LTS | Stable, broad ecosystem |
| Framework | Express | 4.x | Lightweight, modular |
| Language | TypeScript | 5.x | Type safety across stack |
| WebSocket | Socket.IO | 4.x | Zero-latency real-time |
| ORM | Drizzle ORM | 0.30+ | Type-safe, Neon-compatible |
| Auth | Neon Auth | 9.x | Neon managed sessions |
| Validation | Zod | 3.x | Runtime + compile-time validation |
| File Processing | Multer | 1.x | Multipart form (issue photos) |
| LLM | Grok (xAI) | API | Direct API calls for Copilot — no RAG, no embeddings |
| Translation | LibreTranslate (self-hosted) OR Google Translate API | Free | Mother tongue support |
| Task Scheduling | node-cron | 3.x | Periodic karma + analytics recomputation |

### Database & Auth

| Concern | Technology | Notes |
|---------|-----------|-------|
| Database | **Neon PostgreSQL** | Free tier: 512MB, branching, serverless |
| Auth Provider | **Neon Auth** | Neon native authentication |
| Migrations | Drizzle Kit | `drizzle-kit push` for schema sync |

### External Services (Free Tier Only)

| Service | Provider | Free Tier | Purpose |
|---------|---------|-----------|---------|
| Image Storage | **Cloudinary** | 25GB free | Issue photos, profile pics |
| Push Notifications | **Firebase FCM** | Always free | Real-time push |
| Email | **Resend** | 3,000/month free | Leave approval emails |
| LLM Inference | **Grok** | Free tier (generous) | AI Copilot responses |
| Payment | **Razorpay Test Mode** | Free | Finance dues demo |
| PYQ Scraper | **DSpace REST API** | Open | University paper repository |
| Translation | **LibreTranslate** | Self-hosted free | Mother tongue Copilot |

---

## 4. Database Schema (Neon PostgreSQL)

```sql
-- Users & Roles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student','professor','admin','hod','principal','dean')),
  department VARCHAR(100),
  karma_score INTEGER DEFAULT 0,
  preferred_language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notices (triggers RAG index refresh)
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  target_role VARCHAR(50) DEFAULT 'student',
  department VARCHAR(100),
  is_indexed BOOLEAN DEFAULT FALSE,       -- Tracks RAG ingestion status
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Requests (Room Booking, Certificate, etc.)
CREATE TABLE workflow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id),
  type VARCHAR(100) NOT NULL,             -- 'room_booking' | 'certificate' | 'leave'
  status VARCHAR(50) DEFAULT 'pending',   -- 'pending' | 'in_progress' | 'approved' | 'rejected'
  current_stage INTEGER DEFAULT 1,
  total_stages INTEGER NOT NULL,
  metadata JSONB,                         -- Room number, date, description, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval Chain Stages
CREATE TABLE approval_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES workflow_requests(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL,
  approver_id UUID REFERENCES users(id),
  approver_role VARCHAR(50) NOT NULL,     -- 'hod' | 'stucco' | 'dean'
  status VARCHAR(50) DEFAULT 'pending',   -- 'pending' | 'approved' | 'rejected'
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
  category VARCHAR(100),                 -- 'it' | 'facility' | 'academic' | 'other'
  priority VARCHAR(50) DEFAULT 'medium', -- 'low' | 'medium' | 'high' | 'critical'
  status VARCHAR(50) DEFAULT 'open',     -- 'open' | 'in_progress' | 'resolved'
  location_x DECIMAL(10,6),             -- Campus map X coordinate
  location_y DECIMAL(10,6),             -- Campus map Y coordinate
  building VARCHAR(100),
  image_url VARCHAR(500),               -- Cloudinary URL
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
  type VARCHAR(50),                      -- 'class' | 'event' | 'room_booking'
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
  type VARCHAR(100) NOT NULL,            -- 'library' | 'canteen' | 'lab'
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',  -- 'pending' | 'paid'
  razorpay_order_id VARCHAR(200),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Karma Events (for score calculation)
CREATE TABLE karma_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(100) NOT NULL,      -- 'issue_reported' | 'class_attended' | 'room_returned_early'
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plugin Registry (Super App)
CREATE TABLE plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  api_endpoint VARCHAR(500),
  icon_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
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

## 5. API Contract (All Endpoints)

### Auth Module `/api/auth`

| Method | Path | Description | Auth Required |
|--------|------|-------------|--------------|
| POST | `/api/auth/register` | Register user | No |
| POST | `/api/auth/login` | Login → returns JWT | No |
| POST | `/api/auth/logout` | Invalidate session | Yes |
| GET | `/api/auth/me` | Get current user profile | Yes |
| PATCH | `/api/auth/language` | Update preferred language | Yes |

### Dashboard Module `/api/dashboard`

| Method | Path | Description | Auth Required |
|--------|------|-------------|--------------|
| GET | `/api/dashboard/student` | Student dashboard widgets | Yes (student) |
| GET | `/api/dashboard/professor` | Professor dashboard widgets | Yes (professor) |
| GET | `/api/dashboard/admin` | Admin analytics overview | Yes (admin) |

### Workflow / Approvals Module `/api/workflow`

| Method | Path | Description | Auth Required |
|--------|------|-------------|--------------|
| POST | `/api/workflow/request` | Submit any workflow request | Yes |
| GET | `/api/workflow/requests` | List my requests with stage status | Yes |
| GET | `/api/workflow/requests/:id` | Get single request + approval chain | Yes |
| GET | `/api/workflow/pending` | Get requests pending my approval | Yes (approver) |
| POST | `/api/workflow/requests/:id/approve` | One-tap approve stage | Yes (approver) |
| POST | `/api/workflow/requests/:id/reject` | Reject with note | Yes (approver) |

### Notices Module `/api/notices`

| Method | Path | Description | Auth Required |
|--------|------|-------------|--------------|
| POST | `/api/notices` | Publish notice (triggers RAG refresh) | Yes (professor) |
| GET | `/api/notices` | List notices (filterable by dept/role) | Yes |
| GET | `/api/notices/:id` | Get single notice | Yes |

### AI Copilot Module `/api/copilot`

| Method | Path | Description | Auth Required |
|--------|------|-------------|--------------|
| POST | `/api/copilot/chat` | Send message, get RAG response | Yes |
| GET | `/api/copilot/session` | Get conversation memory for user | Yes |
| POST | `/api/copilot/proactive` | Fetch proactive alerts for user | Yes |
| GET | `/api/copilot/languages` | List supported output languages | No |

### Attendance Module `/api/attendance`

| Method | Path | Description | Auth Required |
|--------|------|-------------|--------------|
| POST | `/api/attendance/mark` | Mark attendance for class | Yes (professor) |
| GET | `/api/attendance/class/:classId` | Get attendance for a class | Yes (professor) |
| GET | `/api/attendance/student/:studentId` | Get student attendance summary | Yes |
| GET | `/api/attendance/trends` | Aggregated trends for professor dashboard | Yes (professor) |

### Issues Module `/api/issues`

| Method | Path | Description | Auth Required |
|--------|------|-------------|--------------|
| POST | `/api/issues` | Report issue (multipart: image + data) | Yes |
| GET | `/api/issues` | List issues (filterable) | Yes |
| GET | `/api/issues/heatmap` | Heatmap data points (x,y, density) | Yes |
| PATCH | `/api/issues/:id/status` | Update issue status | Yes (support) |

### Calendar Module `/api/calendar`

| Method | Path | Description | Auth Required |
|--------|------|-------------|--------------|
| GET | `/api/calendar/events` | List all events for date range | Yes |
| GET | `/api/calendar/rooms` | List rooms with availability | Yes |
| POST | `/api/calendar/book` | Book room slot (runs clash detection) | Yes |
| GET | `/api/calendar/clash-check` | Check if slot clashes | Yes |
| GET | `/api/calendar/suggestions` | Get smart slot suggestions | Yes |

### PYQ Module `/api/pyq`

| Method | Path | Description | Auth Required |
|--------|------|-------------|--------------|
| GET | `/api/pyq/papers` | Search/list PYQ papers | Yes |
| GET | `/api/pyq/papers/:id` | Get paper detail + download URL | Yes |
| POST | `/api/pyq/sync` | Trigger DSpace scraper refresh | Yes (admin) |

### Finance Module `/api/finance`

| Method | Path | Description | Auth Required |
|--------|------|-------------|--------------|
| GET | `/api/finance/dues` | List my pending dues | Yes |
| POST | `/api/finance/pay/:dueId` | Initiate Razorpay order | Yes |
| POST | `/api/finance/verify` | Verify Razorpay payment signature | Yes |

### Analytics Module `/api/analytics`

| Method | Path | Description | Auth Required |
|--------|------|-------------|--------------|
| GET | `/api/analytics/attendance` | Attendance trend aggregates | Yes (admin/professor) |
| GET | `/api/analytics/approvals` | Approval delay bottlenecks | Yes (admin) |
| GET | `/api/analytics/issues` | Issue resolution stats + heatmap | Yes (admin) |

### Karma Module `/api/karma`

| Method | Path | Description | Auth Required |
|--------|------|-------------|--------------|
| GET | `/api/karma/score` | Get my karma score + breakdown | Yes |
| GET | `/api/karma/leaderboard` | Top karma students | Yes |

### Plugins Module `/api/plugins`

| Method | Path | Description | Auth Required |
|--------|------|-------------|--------------|
| GET | `/api/plugins` | List all active plugins | Yes |
| GET | `/api/plugins/:slug` | Get plugin detail + endpoint | Yes |
| POST | `/api/plugins` | Register new plugin | Yes (admin) |

---

## 6. WebSocket Events

Server → Client events (via Socket.IO):

| Event | Payload | Trigger |
|-------|---------|---------|
| `approval:updated` | `{ requestId, stage, status, approver }` | Approval stage changes |
| `issue:created` | `{ issueId, location, category }` | New issue submitted |
| `heatmap:update` | `{ points: [{x,y,count}] }` | Issue submitted → heatmap refresh |
| `notice:new` | `{ noticeId, title, targetRole }` | Professor publishes notice |
| `notification:push` | `{ type, message, actionUrl }` | Any user-targeted alert |
| `attendance:updated` | `{ classId, trends }` | Professor marks attendance |

Client → Server events:

| Event | Payload |
|-------|---------|
| `join:user` | `{ userId, role }` |
| `join:room` | `{ requestId }` | Subscribe to approval room |

---

## 7. Environment Variables

### `apps/mobile/.env`

```env
# API
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_WS_URL=http://localhost:3000

# Expo
EXPO_PUBLIC_APP_NAME=Aether
EXPO_PUBLIC_APP_SLUG=aether-campus-os

# Razorpay (test mode - safe to commit test key)
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_PLACEHOLDER
```

### `apps/backend/.env`

```env
# Server
PORT=3000
NODE_ENV=development

# Neon Database & Auth
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/aether?sslmode=require
NEON_AUTH_JWKS_URL=your_neon_auth_jwks_url

# Firebase FCM (Push Notifications)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nPLACEHOLDER\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Grok (xAI API)
XAI_API_KEY=xai_PLACEHOLDER

# Pinecone (Vector Database)
PINECONE_API_KEY=pc-PLACEHOLDER
PINECONE_ENVIRONMENT=us-east-1

# Resend (Email — 3000/month free)
RESEND_API_KEY=re_PLACEHOLDER

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_PLACEHOLDER
RAZORPAY_KEY_SECRET=PLACEHOLDER

# LibreTranslate (Self-hosted OR public instance)
LIBRE_TRANSLATE_URL=https://libretranslate.com
LIBRE_TRANSLATE_API_KEY=PLACEHOLDER

# DSpace PYQ Scraper
DSPACE_BASE_URL=https://your-university.dspace.edu/rest
DSPACE_COMMUNITY_ID=PLACEHOLDER

# CORS
ALLOWED_ORIGINS=http://localhost:8081,exp://localhost:8081
```

---

## 8. Free Tier API Setup Guide

| Service | How to Get Free Key |
|---------|---------------------|
| **Neon** | [neon.tech](https://neon.tech) → Sign up → New Project → Copy connection string |
| **Firebase FCM** | [console.firebase.google.com](https://console.firebase.google.com) → New project → Project Settings → Service Accounts → Generate key |
| **Cloudinary** | [cloudinary.com](https://cloudinary.com) → Sign up free → Dashboard → API keys |
| **Grok (xAI)** | [console.x.ai](https://console.x.ai) → Sign up → API keys |
| **Pinecone** | [app.pinecone.io](https://app.pinecone.io) → Sign up → Create Serverless Index → API keys |
| **Resend** | [resend.com](https://resend.com) → Sign up → API Keys |
| **Razorpay** | [razorpay.com](https://razorpay.com) → Sign up → Test Mode → Settings → API Keys |
| **LibreTranslate** | Use public endpoint `https://libretranslate.com` with free account OR self-host with Docker |

---

## 9. Startup Scripts

### `scripts/start.sh` (Mac/Linux — starts both frontend + backend)

```bash
#!/bin/bash
set -e

echo "🚀 Starting Aether Campus OS..."

# Start backend
echo "📡 Starting Backend (Node.js)..."
cd apps/backend
npm install
npm run dev &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 3

# Start mobile frontend
echo "📱 Starting Mobile Frontend (Expo)..."
cd ../mobile
npm install
npx expo start --go &
FRONTEND_PID=$!

echo "✅ Aether is running!"
echo "   Backend:  http://localhost:3000"
echo "   Expo Go:  Scan the QR code above with the Expo Go app"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '⛔ Aether stopped.'" EXIT
wait
```

### `scripts/start.bat` (Windows)

```bat
@echo off
echo Starting Aether Campus OS...

:: Start backend
echo Starting Backend (Node.js)...
cd apps\backend
start cmd /k "npm install && npm run dev"

:: Wait for backend
timeout /t 4

:: Start mobile frontend
echo Starting Mobile Frontend (Expo)...
cd ..\mobile
start cmd /k "npm install && npx expo start --go"

echo Aether is running!
echo   Backend:  http://localhost:3000
echo   Expo Go:  Scan the QR code in the Expo window with the Expo Go app
pause
```

### `scripts/backend.sh` (Backend only)

```bash
#!/bin/bash
cd apps/backend
npm install
npm run dev
```

### `scripts/backend.bat` (Backend only — Windows)

```bat
@echo off
cd apps\backend
npm install
npm run dev
pause
```

---

## 10. Implementation Order (Dependency-Sequenced)

### Phase 1 — Foundation (FIRST)
1. `packages/shared-types` — Define all TypeScript interfaces
2. `apps/backend/src/shared/db/neon.client.ts` — DB connection
3. DB migrations — Run all `CREATE TABLE` statements via Drizzle Kit
4. `apps/backend/src/modules/auth` — Auth module (every other module depends on this)
5. `apps/backend/src/shared/websocket/ws.server.ts` — Socket.IO setup

### Phase 2 — Core Backend Modules
6. Users module
7. Dashboard module
8. Workflow / Approvals module (with approver-resolver)
9. Notices module (with RAG index trigger)
10. Copilot module (RAG pipeline — Grok + Grok (or placeholder) embeddings)
11. Attendance module
12. Issues module + Heatmap service
13. Calendar module + Clash Detection
14. PYQ module
15. Finance module + Razorpay
16. Analytics module
17. Karma module
18. Plugins module

### Phase 3 — Mobile Frontend
19. Expo app scaffold + Expo Router setup
20. Auth screens (login, role select)
21. Student Dashboard + widgets
22. Professor Dashboard + widgets
23. Copilot FAB + chat screen
24. Workflow request + Swiggy Progress Bar
25. Issue reporting + camera + heatmap
26. Calendar + booking + clash UI
27. PYQ screen
28. Finance dues + payment screen
29. Faculty workspace screens (attendance, leave, follow-up, notices)
30. Admin analytics screen
31. Plugin shell + plugin registry

### Phase 4 — Integration & Polish
32. Connect all mobile screens to live API endpoints
33. WebSocket integration (real-time updates)
34. Push notification integration (FCM via Expo)
35. End-to-end demo data seeding script
36. `.env` files completed with real keys

### Phase 5 — DevOps & Deployment (LAST)
37. Dockerize backend (optional for demo)
38. Deploy backend to Render/Railway (free tier)
39. Point mobile app `.env` to production URL
40. Set up CI/CD (optional — GitHub Actions)

---

## 11. Key Architectural Decisions

| Decision | Choice | Rationale |
|---------|--------|-----------|
| **Mobile Framework** | React Native + Expo Go | Fast iteration, no native builds, QR scan to test |
| **Styling** | RN StyleSheet (NO Tailwind) | Vanilla RN styles, design tokens in `constants/` |
| **Database** | Neon PostgreSQL | Free serverless PostgreSQL, branching for dev/prod |
| **Auth** | Neon Auth | Fully integrated managed auth with Neon |
| **Real-time** | Socket.IO | Approval bar, heatmap — bi-directional events |
| **LLM** | Grok (xAI) | Core reasoning engine |
| **Vector DB** | Pinecone | Serverless free tier for embeddings |
| **Storage** | Cloudinary | 25GB free, excellent mobile SDK |
| **State** | Zustand | Minimal boilerplate for mobile |
| **Deployment Order** | Frontend → Backend → DB → DevOps | Prevents deployment issues blocking feature work |

---

## 12. Copilot Architecture — Direct Grok API (No RAG)

> ⚠️ **CRITICAL:** There is NO RAG pipeline. NO Pinecone. NO LangChain. NO vector embeddings. The Copilot achieves context-awareness by fetching structured data directly from the Neon PostgreSQL database and injecting it as text context into a Grok API prompt.

```
Professor publishes notice
        │
        ▼
notices.service.ts
  → INSERT into notices table (title, content, department, target_role)
  → No vector indexing. No external service call. Done.
        │
        ▼
Student asks Copilot question
        │
        ▼
copilot.service.ts
  → Step 1: Fetch context from DB via context-builder.ts:
        → SELECT last 10 notices WHERE department = user.department
        → SELECT pending workflow_requests WHERE requester_id = user.id
        → SELECT pending finance_dues WHERE student_id = user.id
        → SELECT user profile (name, karma_score, preferred_language)
  → Step 2: Build structured prompt:
        System: "You are Aether Copilot..."
        Context block: [notices as text] + [pending requests] + [dues] + [user profile]
        User message: [student's query]
        Instruction: "Answer concisely with 2-3 actionable steps."
  → Step 3: Call Grok API (xAI chat completion) — single direct API call
  → Step 4: If user.preferred_language ≠ 'en':
        → Call translation.service.ts (LibreTranslate)
  → Step 5: Return response + actionable steps to mobile
```

### Proactive Alerts (Deterministic — Not LLM)

```
GET /api/copilot/proactive
  → Query DB: workflow_requests WHERE status='pending' AND requester_id=user.id
  → Query DB: finance_dues WHERE status='pending' AND student_id=user.id
  → Query DB: calendar_events WHERE type='deadline' AND start_time < NOW()+2days
  → Build alert list from results — NO Grok call
  → Return structured alerts array to mobile
```

---

## 13. Super App Plugin Architecture — Iframe Micro-Frontend + aether-bridge.js

> ⚠️ **CRITICAL:** This is NOT a React Native WebView implementation. This feature is a **web-based host shell** using iframes and `window.postMessage`. Do NOT pass auth tokens to mini-apps. Only scoped data is pushed via the bridge SDK.

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Aether Host Shell (web dashboard — React + Express)         │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ Mini Apps   │  │  Developer  │  │  Admin Panel   │  │
│  │ Dashboard   │  │  Portal     │  │  (Audit View)  │  │
│  └─────────────┘  └─────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
                      │ postMessage
              ┌───────┴───────┐
              │  <iframe>      │
              │  Canteen       │  ← deployed on Vercel
              │  Tracker App   │
              │  (uses        │
              │  aether-bridge)│
              └───────────────┘
```

### End-to-End Flow

```
Step 1 — Developer Submits Mini-App:
  POST /api/plugins { name, description, category, deployment_url, permissions[] }
  → Backend calls Grok API with submission metadata
  → Grok returns Security Clearance Certificate JSON:
       { riskLevel, findings[], recommendation, compliance }
  → Stored in plugins table as grok_audit_report (JSONB)
  → Plugin status = 'pending'

Step 2 — Admin Reviews:
  Admin opens Developer Portal audit view
  → Sees "scanning" animation while Grok call completes
  → Sees PDF/card-style Security Clearance Certificate
  → Clicks "Approve" → PATCH /api/plugins/:id { status: 'approved' }

Step 3 — Live Icon Injection:
  Host Shell polls or receives WebSocket 'plugin:approved' event
  → Fetches GET /api/plugins (returns all approved plugins)
  → Renders new plugin icon in Mini Apps section — no rebuild

Step 4 — User Opens Mini-App:
  User clicks plugin icon
  → Host Shell creates <iframe src="deployment_url" sandbox="allow-scripts allow-same-origin">
  → Host Shell calls: iframe.contentWindow.postMessage({ type: 'AETHER_INIT', payload: { userName, role, department } }, '*')
  → Mini-app listens via aether-bridge.js:
       window.addEventListener('message', (e) => { if (e.data.type === 'AETHER_INIT') { greet(e.data.payload.userName) } })
  → Canteen Tracker displays: "Welcome, Priyank!"
```

### aether-bridge.js (SDK Interface)

```javascript
// aether-bridge.js — include in any mini-app
const AetherBridge = {
  user: null,
  onReady(callback) {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'AETHER_INIT') {
        this.user = event.data.payload; // { userName, role, department }
        callback(this.user);
      }
    });
  }
};
```

### plugins Table Schema (Updated)

```sql
CREATE TABLE plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  deployment_url VARCHAR(500) NOT NULL,    -- External URL loaded in iframe
  permissions JSONB DEFAULT '[]',          -- Declared permissions from developer
  status VARCHAR(50) DEFAULT 'pending',    -- 'pending' | 'approved' | 'rejected'
  grok_audit_report JSONB,                 -- Full Security Clearance Certificate from Grok
  submitted_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT FALSE,         -- True only when status='approved'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

*Document generated: 2026-04-18 | Status: Ready for Development*
