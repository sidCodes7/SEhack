---
project: Aether — Autonomous Campus Operating System
version: 1.0.0
lastUpdated: 2026-04-18
sections_completed: [stack, styling, patterns, api, db, realtime, ai, auth, testing, environment]
---

# Aether — Project Context for AI Agents

> This file contains **critical rules and non-obvious implementation details** that AI agents MUST follow when generating code for the Aether project. Read this file completely before writing any code.

---

## 🔴 CRITICAL RULES — NEVER VIOLATE

1. **NO Tailwind CSS.** React Native uses `StyleSheet.create({})` only. All design tokens live in `apps/mobile/constants/colors.ts`, `typography.ts`, and `spacing.ts`. Import from there — never hardcode colors or sizes inline.

2. **Expo Go compatibility strictly enforced.** Do NOT use any package that requires native code builds or `expo prebuild`. All packages must be on the Expo Go compatible list. Check [expo.dev/go](https://expo.dev/go) before adding dependencies.

3. **Deployment phase is LAST.** Do not add Docker files, CI/CD configs, or deployment scripts until the explicit "Phase 5 — DevOps" task. All previous phases assume local development only.

4. **All API calls go through `apps/mobile/services/api.ts`.** Never use `fetch()` directly in components or screens. The Axios instance in `api.ts` handles auth token injection and base URL via environment variables.

5. **Environment variables in Expo must be prefixed `EXPO_PUBLIC_`** to be accessible in the app bundle. Backend vars do NOT use this prefix.

6. **Never hardcode API URLs.** Always use `process.env.EXPO_PUBLIC_API_BASE_URL` (mobile) or `process.env.PORT` (backend). These are injected from `.env` files.

7. **Free-tier services only.** Do NOT suggest paid plans or paid-tier quotas as prerequisites.

8. **Wireframe-driven UI.** Every mobile screen has a wireframe reference in `docs/wireframes/`. Each wireframe folder contains:
   - `screen.png` — **The visual source of truth.** Match the layout, button colors, spacing, element positioning, and overall look-and-feel from this screenshot exactly.
   - `code.html` — **Behavioral reference ONLY.** Read this to understand how elements behave (click handlers, state changes, animations, form flows). Do NOT copy the HTML/CSS code. Implement everything in React Native with `StyleSheet.create()` using the project's design tokens.

   **Available wireframes** (in `docs/wireframes/`):
   | Wireframe Folder | Maps To Screen |
   |-----------------|----------------|
   | `splash_screen/` | App splash / loading screen |
   | `login_screen/` | `(auth)/login.tsx` |
   | `role_selector/` | `(auth)/role-select.tsx` |
   | `student_dashboard/` | `(student)/dashboard.tsx` |
   | `professor_dashboard/` | `(professor)/dashboard.tsx` |
   | `admin_dashboard_overview/` | `(admin)/analytics.tsx` |
   | `aether_copilot/` | `(student)/copilot/index.tsx` + `CopilotChat.tsx` |
   | `submit_request/` | `(student)/bookings/request.tsx` |
   | `track_request/` | `(student)/bookings/status.tsx` |
   | `approvals_queue/` | `(professor)/leave-approvals/index.tsx` |
   | `calendar_view/` | `(student)/calendar/index.tsx` |
   | `clash_detection_warning/` | Clash detection modal in calendar/bookings |
   | `report_an_issue/` | `(student)/issues/report.tsx` |
   | `campus_issue_heatmap/` | `(student)/issues/heatmap.tsx` |
   | `finance_dues/` | `(student)/finance/index.tsx` |
   | `pyq_discovery/` | `(student)/pyq/index.tsx` |
   | `attendance_marking/` | `(professor)/attendance/index.tsx` |
   | `notice_publisher/` | `(professor)/notices/index.tsx` |
   | `karma_score_leaderboard/` | Karma widget + leaderboard screen |
   | `approval_analytics/` | Admin analytics — approval bottleneck view |
   | `attendance_analytics/` | Admin analytics — attendance trends view |
   | `issue_analytics/` | Admin analytics — issue resolution view |
   | `aether_editorial/` | Editorial / notices feed view |

---

## 📁 Project Structure

```
aether/
├── apps/
│   ├── mobile/        ← React Native (Expo SDK 50, Expo Router v3)
│   └── backend/       ← Node.js 20 LTS, Express 4, TypeScript 5
├── packages/
│   └── shared-types/  ← Shared TS interfaces used by both apps
├── docs/              ← Architecture, API spec, developer portal
└── scripts/           ← .sh and .bat startup scripts
```

This is an **npm workspaces monorepo**. Root `package.json` declares workspaces. Run `npm install` at root to install all dependencies.

---

## 📱 Mobile (React Native + Expo)

### Routing
- Uses **Expo Router v3** (file-based routing like Next.js App Router)
- Route groups: `(auth)`, `(student)`, `(professor)`, `(admin)`
- Protected routes check JWT via `useAuth()` hook in `hooks/useAuth.ts`
- `_layout.tsx` at each level handles layout and auth guards

### Styling Rules
```typescript
// ✅ CORRECT — always use StyleSheet
import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
});

// ❌ WRONG — never do this
<View style={{ backgroundColor: '#1a1a2e', padding: 16 }} />
```

### Design Tokens (constants/)
```typescript
// colors.ts - Import and follow this exactly
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

// spacing.ts
export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

// typography.ts
export const FONTS = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};
```

### State Management (Zustand)
```typescript
// Pattern for all stores in store/
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

### API Service Pattern
```typescript
// All API calls go through services/, never direct fetch in components
// api.ts sets up Axios with auth interceptors
import api from './api';

export const approvalsService = {
  getMyRequests: () => api.get<WorkflowRequest[]>('/workflow/requests'),
  approveStage: (requestId: string, note?: string) =>
    api.post(`/workflow/requests/${requestId}/approve`, { note }),
};
```

### WebSocket Pattern
```typescript
// useWebSocket.ts hook — use this, don't create new Socket.IO connections
import { useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

// In component:
const { socket } = useWebSocket();
useEffect(() => {
  socket.on('approval:updated', (data) => { /* update local state */ });
  return () => socket.off('approval:updated');
}, [socket]);
```

---

## 🖥️ Backend (Node.js + Express + TypeScript)

### Module Structure
Every backend module follows this EXACT pattern:
```
modules/[name]/
├── [name].controller.ts   ← HTTP layer only, no business logic
├── [name].service.ts      ← All business logic here
├── [name].routes.ts       ← Express router, attaches middleware + controller
└── (optional sub-services)
```

### Controller Pattern
```typescript
// controllers ONLY handle HTTP — delegate all logic to service
export const workflowController = {
  getMyRequests: async (req: AuthRequest, res: Response) => {
    try {
      const requests = await workflowService.getRequestsByUser(req.user!.id);
      res.json({ success: true, data: requests });
    } catch (error) {
      next(error); // passes to error.middleware.ts
    }
  },
};
```

### Auth Middleware
```typescript
// All protected routes use this middleware
// Validates JWT, attaches user to req.user
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/workflow', authMiddleware, workflowRoutes);
```

### Response Format (ALWAYS use this shape)
```typescript
// Success
res.json({ success: true, data: payload });

// Error (handled by error.middleware.ts globally)
res.status(400).json({ success: false, error: 'Descriptive message' });

// Paginated
res.json({ success: true, data: items, meta: { total, page, limit } });
```

### Database (Drizzle ORM + Neon)
```typescript
// Use Drizzle ORM — never write raw SQL except in migrations
import { db } from '../shared/db/neon.client';
import { workflowRequests } from '../shared/db/schema';
import { eq, and } from 'drizzle-orm';

const requests = await db
  .select()
  .from(workflowRequests)
  .where(eq(workflowRequests.requesterId, userId));
```

### WebSocket Emission Pattern
```typescript
// Always emit through ws.server.ts helper, never import io directly in services
import { emitToUser, emitToRoom } from '../shared/websocket/ws.server';

// After approval state changes:
emitToUser(requesterId, 'approval:updated', { requestId, stage, status });
```

---

## 🗄️ Database Rules

- **ORM**: Drizzle ORM — schema defined in `apps/backend/src/shared/db/schema.ts`
- **Migrations**: Use `drizzle-kit push` for schema changes during development. Never manually ALTER tables in production.
- **Pinecone**: Store vector embeddings in Pinecone Serverless Index. No pgvector needed in Neon. Used for Copilot RAG embeddings.
- **UUIDs**: All primary keys are UUIDs using `gen_random_uuid()` — never auto-increment integers.
- **Timestamps**: Always `TIMESTAMPTZ` (timezone-aware), never `TIMESTAMP`.
- **JSONB**: Use for flexible metadata (workflow request details, plugin config, copilot message history).

---

## 🤖 Copilot / Direct Grok API Rules

> ❌ **NEVER implement a RAG pipeline.** NO Pinecone. NO LangChain. NO vector embeddings. NO `rag.service.ts`.

- **LLM:** Grok API (xAI) — direct `POST` to the xAI chat completions endpoint. Use `XAI_API_KEY` from env.
- **Context strategy:** Before calling Grok, `context-builder.ts` fetches from Neon PostgreSQL:
  1. Last 10 notices for the user's department (`SELECT ... FROM notices WHERE department = $1 ORDER BY created_at DESC LIMIT 10`)
  2. User's pending workflow requests
  3. User's outstanding finance dues
  4. User profile (name, role, department, karma_score, preferred_language)
- **Prompt structure (ALWAYS follow this):**
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
- **Translation:** LibreTranslate called AFTER Grok returns. If `preferred_language === 'en'` skip translation entirely.
- **Proactive alerts:** `GET /api/copilot/proactive` — deterministic DB queries ONLY. No Grok call. Returns rule-based alerts.
- **Notice loop:** When a professor publishes a notice, `notices.service.ts` simply INSERT into DB. No external call, no indexing. Copilot reads the fresh notice on the next user query.

---

## 🔒 Authentication

- **Auth Service**: Neon Auth (managed authentication)
- **Token storage (mobile)**: Use `expo-secure-store` — NEVER `AsyncStorage` for session tokens.
- **Auth header**: `Authorization: Bearer <token>` — set automatically by Axios interceptor in `api.ts`, representing the Neon Auth session.
- **Role checking**: Backend middleware validates Neon Auth token and checks user roles for protected resources. Mobile does NOT enforce permissions — server is the authority.
- **Password hashing**: Handled securely natively by Neon Auth.

---

## 💳 Payment (Razorpay)

- **Test mode only** during development. Use test credentials from `.env`.
- **Flow**: Mobile calls `POST /api/finance/pay/:dueId` → backend creates Razorpay order → returns `orderId` to mobile → mobile opens Razorpay checkout → on success, mobile calls `POST /api/finance/verify` with payment signature → backend verifies and marks due as paid.
- **Never trust mobile for payment confirmation** — always verify `razorpay_signature` on backend.

---

## 🖼️ File Upload (Cloudinary)

- **Upload happens server-side**: Mobile sends image to `POST /api/issues` as multipart form → backend receives via Multer → uploads to Cloudinary → stores URL in DB.
- **Never expose Cloudinary API secret to mobile.**
- **Image size limit**: 10MB via Multer config.

---

## ⚡ Real-time (Socket.IO)

- **Server namespace**: Default (`/`)
- **Rooms**: Each user joins room `user:{userId}` on connect. Approval tracking: join room `request:{requestId}`.
- **Auth**: Socket connection requires Neon Auth session token in `auth.token` handshake data. Server validates before allowing connection.
- **Reconnection**: Mobile Socket.IO client configured with `reconnection: true, reconnectionDelay: 1000`.

---

## 🧩 Plugin System (Super App — Iframe Micro-Frontend)

> ❌ **NEVER use React Native WebView for the plugin system.** This feature is a **web-based host shell**. Do NOT pass auth tokens to mini-apps.

- **Host Shell:** A web dashboard (React + Express) that renders plugin icons and loads mini-apps inside sandboxed `<iframe>` elements.
- **Plugin registry:** `plugins` table in Neon PostgreSQL. Fields: `name`, `slug`, `deployment_url`, `category`, `status` (`pending`/`approved`/`rejected`), `grok_audit_report` (JSONB), `is_active`.
- **Mini-app loading:** On user clicking a plugin icon, the Host Shell creates `<iframe src="{deployment_url}" sandbox="allow-scripts allow-same-origin">`. The iframe URL points to the externally hosted mini-app (e.g., Vercel).
- **aether-bridge.js (SDK):** A standalone JS file provided to mini-app developers. Uses `window.postMessage` for communication:
  ```javascript
  // Host Shell sends scoped data to iframe:
  iframe.contentWindow.postMessage({ type: 'AETHER_INIT', payload: { userName, role, department } }, '*');

  // Mini-app receives via aether-bridge.js:
  window.addEventListener('message', (e) => {
    if (e.data.type === 'AETHER_INIT') { /* greet user */ }
  });
  ```
- **Scoped access only:** The shell pushes ONLY `{ userName, role, department }` to the iframe. NO auth tokens. NO direct Aether API access from inside the mini-app.
- **AI Security Audit:** On `POST /api/plugins`, backend calls Grok API with `{ appName, deploymentUrl, category, permissions }` and stores the returned Security Clearance Certificate in `grok_audit_report`. Show a "scanning" animation in the UI while Grok responds.
- **Security Clearance Certificate format (Grok output):**
  ```json
  { "riskLevel": "LOW", "findings": [...], "recommendation": "APPROVE", "compliance": "Data Privacy OK" }
  ```
- **Admin approval:** `PATCH /api/plugins/:id { status: 'approved', is_active: true }` — triggers WebSocket `plugin:approved` event to all connected Host Shell clients.
- **Demo Canteen Tracker:** Deployed as a real app on Vercel. Implements `aether-bridge.js` to greet the user by name on load. Pre-registered in seed data.

---

## 🌍 Internationalization (Mother Tongue)

- **Default language**: English (`en`)
- **Supported**: `en`, `hi` (Hindi), `ta` (Tamil), `mr` (Marathi), `te` (Telugu)
- **User preference**: Stored in `users.preferred_language`. Updated via `PATCH /api/auth/language`.
- **Translation scope**: Copilot responses only (not the full UI in v1).
- **Implementation**: After Grok returns English response, if `preferred_language !== 'en'`, call `translation.service.ts:translate(text, targetLang)` using LibreTranslate.

---

## 🧪 Testing Approach

- **Unit tests**: Jest for service layer (business logic). Mock DB calls.
- **Integration tests**: Supertest for API routes with test DB.
- **Mobile**: Expo testing library for critical components.
- **Test DB**: Use Neon branching to create isolated test branch — `drizzle-kit push` against test branch.
- **Coverage target**: 70%+ for service layer, 0% required for controller layer (covered by integration tests).

---

## 📋 Coding Conventions

### File Naming
- **Mobile screens**: `PascalCase.tsx` (e.g., `Dashboard.tsx`)
- **Mobile components**: `PascalCase.tsx` (e.g., `ApprovalProgressBar.tsx`)
- **Backend files**: `kebab-case.pattern.ts` (e.g., `clash-detector.ts`, `workflow.service.ts`)
- **Shared types**: `camelCase.types.ts` (e.g., `user.types.ts`)

### TypeScript
- **Strict mode**: `"strict": true` in all `tsconfig.json` files
- **No `any`**: Use `unknown` then narrow, or create proper interfaces
- **Enums for roles**: Use string literal unions, NOT TypeScript enums (serialization issues)
  ```typescript
  // ✅ Correct
  type UserRole = 'student' | 'professor' | 'admin' | 'hod' | 'dean';
  // ❌ Wrong
  enum UserRole { Student = 'student' }
  ```

### Imports
- **Absolute imports** in mobile: configured via `babel.config.js` path aliases (`@components/`, `@services/`, `@hooks/`)
- **Relative imports** in backend: use relative paths within a module, absolute for cross-module

### Error Handling
- All async route handlers use `try/catch` and call `next(error)`
- `error.middleware.ts` is the single global error handler
- Never `console.error` in production — use the logger middleware

---

## 🚀 Running Locally (Quick Reference)

```bash
# Install all dependencies (from root)
npm install

# Start everything (Mac/Linux)
chmod +x scripts/start.sh && ./scripts/start.sh

# Start everything (Windows)
scripts\start.bat

# Backend only
./scripts/backend.sh   # or backend.bat

# Mobile only
cd apps/mobile && npx expo start --go

# Database migrations
cd apps/backend && npx drizzle-kit push
```

**Expo Go setup**: Install [Expo Go](https://expo.dev/go) on your phone. Scan QR code from terminal. Ensure phone and dev machine are on the same WiFi network.

---

*This context file is the ground truth for all AI agents implementing Aether. When in doubt, follow the patterns here — do not invent new patterns without updating this file.*
