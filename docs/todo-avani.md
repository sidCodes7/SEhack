# 📱 Avani — Full Mobile Frontend (React Native + Expo)

> **Role:** Mobile Frontend Developer
> **Owns:** The ENTIRE `apps/mobile/` directory — all screens, components, hooks, services, stores, constants, types, styles, and config files

---

## 🔴 PREREQUISITE — Wait for Sid's Sprint 0 Push

**Do NOT start coding until Sid pushes the scaffold commit.**

Once Sid pushes, run:
```bash
git pull origin main
npm install      # from repo root
```

Verify:
- `packages/shared-types/src/` exists with all type interfaces
- Root `package.json` has workspaces configured

Then scaffold your mobile app:
```bash
cd apps
npx -y create-expo-app@latest mobile --template blank-typescript
cd mobile
npx expo install expo-router expo-secure-store expo-camera expo-image-picker expo-notifications
npm install axios socket.io-client zustand react-native-maps
```

> ⚠️ **EXPO GO ONLY.** Before installing ANY package, check [expo.dev/go](https://expo.dev/go) for compatibility. No native builds. No `expo prebuild`.

---

## 🎨 WIREFRAME USAGE RULE — Read Before Building ANY Screen

Every screen you build has a wireframe reference in `docs/wireframes/`. Each wireframe folder contains two files:

| File | What It Is | How To Use It |
|------|-----------|---------------|
| `screen.png` | **Visual source of truth** | Match this EXACTLY — layout, button colors, element positioning, spacing, typography weight, card shapes, icon placement. This is what the screen must look like. |
| `code.html` | **Behavioral reference only** | Read this to understand how elements behave — click handlers, state changes, animations, transitions, form validation flows. Do NOT copy the HTML/CSS. Implement in React Native `StyleSheet.create()` using design tokens from `constants/`. |

> ❌ **NEVER copy HTML/CSS from `code.html` into React Native.** It is vanilla web code. Your implementation MUST use React Native components + `StyleSheet.create()` + design tokens.

### Wireframe → Screen Mapping

| Wireframe Folder | Your Screen File |
|-----------------|------------------|
| `docs/wireframes/splash_screen/` | App splash / loading |
| `docs/wireframes/login_screen/` | `app/(auth)/login.tsx` |
| `docs/wireframes/role_selector/` | `app/(auth)/role-select.tsx` |
| `docs/wireframes/student_dashboard/` | `app/(student)/dashboard.tsx` |
| `docs/wireframes/professor_dashboard/` | `app/(professor)/dashboard.tsx` |
| `docs/wireframes/admin_dashboard_overview/` | `app/(admin)/analytics.tsx` |
| `docs/wireframes/aether_copilot/` | `app/(student)/copilot/index.tsx` + `CopilotChat.tsx` |
| `docs/wireframes/submit_request/` | `app/(student)/bookings/request.tsx` |
| `docs/wireframes/track_request/` | `app/(student)/bookings/status.tsx` |
| `docs/wireframes/approvals_queue/` | `app/(professor)/leave-approvals/index.tsx` |
| `docs/wireframes/calendar_view/` | `app/(student)/calendar/index.tsx` |
| `docs/wireframes/clash_detection_warning/` | Clash detection modal in calendar/bookings |
| `docs/wireframes/report_an_issue/` | `app/(student)/issues/report.tsx` |
| `docs/wireframes/campus_issue_heatmap/` | `app/(student)/issues/heatmap.tsx` |
| `docs/wireframes/finance_dues/` | `app/(student)/finance/index.tsx` |
| `docs/wireframes/pyq_discovery/` | `app/(student)/pyq/index.tsx` |
| `docs/wireframes/attendance_marking/` | `app/(professor)/attendance/index.tsx` |
| `docs/wireframes/notice_publisher/` | `app/(professor)/notices/index.tsx` |
| `docs/wireframes/karma_score_leaderboard/` | `KarmaScoreWidget.tsx` + leaderboard view |
| `docs/wireframes/approval_analytics/` | Admin analytics — approval bottleneck section |
| `docs/wireframes/attendance_analytics/` | Admin analytics — attendance trends section |
| `docs/wireframes/issue_analytics/` | Admin analytics — issue resolution section |
| `docs/wireframes/aether_editorial/` | Editorial / notices feed view |

---

## Files You Own (ONLY you touch these)

```
# EVERYTHING inside apps/mobile/
apps/mobile/package.json
apps/mobile/tsconfig.json
apps/mobile/app.json
apps/mobile/babel.config.js
apps/mobile/.env

# Screens (Expo Router file-based routing)
apps/mobile/app/_layout.tsx
apps/mobile/app/(auth)/login.tsx
apps/mobile/app/(auth)/role-select.tsx
apps/mobile/app/(student)/dashboard.tsx
apps/mobile/app/(student)/pyq/index.tsx
apps/mobile/app/(student)/finance/index.tsx
apps/mobile/app/(student)/finance/payment.tsx
apps/mobile/app/(student)/issues/report.tsx
apps/mobile/app/(student)/issues/heatmap.tsx
apps/mobile/app/(student)/bookings/request.tsx
apps/mobile/app/(student)/bookings/status.tsx
apps/mobile/app/(student)/calendar/index.tsx
apps/mobile/app/(student)/copilot/index.tsx
apps/mobile/app/(professor)/dashboard.tsx
apps/mobile/app/(professor)/attendance/index.tsx
apps/mobile/app/(professor)/leave-approvals/index.tsx
apps/mobile/app/(professor)/follow-ups/index.tsx
apps/mobile/app/(professor)/notices/index.tsx
apps/mobile/app/(admin)/analytics.tsx

# Components
apps/mobile/components/common/Button.tsx
apps/mobile/components/common/Card.tsx
apps/mobile/components/common/Badge.tsx
apps/mobile/components/common/Avatar.tsx
apps/mobile/components/common/LoadingSpinner.tsx
apps/mobile/components/common/NotificationBanner.tsx
apps/mobile/components/dashboard/KarmaScoreWidget.tsx
apps/mobile/components/dashboard/NextClassWidget.tsx
apps/mobile/components/dashboard/FinanceDueWidget.tsx
apps/mobile/components/dashboard/QuickActionsWidget.tsx
apps/mobile/components/approvals/ApprovalProgressBar.tsx
apps/mobile/components/approvals/ApprovalCard.tsx
apps/mobile/components/copilot/CopilotFAB.tsx
apps/mobile/components/copilot/CopilotChat.tsx
apps/mobile/components/copilot/LanguageToggle.tsx
apps/mobile/components/heatmap/CampusHeatmap.tsx

# Constants (Design Tokens)
apps/mobile/constants/colors.ts
apps/mobile/constants/typography.ts
apps/mobile/constants/spacing.ts

# Hooks
apps/mobile/hooks/useAuth.ts
apps/mobile/hooks/useWebSocket.ts
apps/mobile/hooks/useNotifications.ts
apps/mobile/hooks/useCopilot.ts

# Services (API layer — ALL calls go through these)
apps/mobile/services/api.ts
apps/mobile/services/auth.service.ts
apps/mobile/services/approvals.service.ts
apps/mobile/services/copilot.service.ts
apps/mobile/services/issues.service.ts
apps/mobile/services/notifications.service.ts
apps/mobile/services/calendar.service.ts
apps/mobile/services/finance.service.ts
apps/mobile/services/pyq.service.ts
apps/mobile/services/attendance.service.ts
apps/mobile/services/analytics.service.ts
apps/mobile/services/karma.service.ts
apps/mobile/services/dashboard.service.ts

# Stores (Zustand)
apps/mobile/store/auth.store.ts
apps/mobile/store/notifications.store.ts
apps/mobile/store/copilot.store.ts

# Types (local types that extend shared-types for mobile use)
apps/mobile/types/user.types.ts
apps/mobile/types/approval.types.ts
apps/mobile/types/issue.types.ts
apps/mobile/types/copilot.types.ts

# Utils
apps/mobile/utils/format.ts
apps/mobile/utils/validation.ts
apps/mobile/utils/clash-detection.ts

# Styles
apps/mobile/styles/global.ts
```

---

## Sprint 0 — Expo Scaffold + Design System + Core Infrastructure

> ⏳ Wait for: Sid's S0 push (scaffold + shared-types)

- [x] Create Expo app inside `apps/mobile/` (see prerequisite commands above)
- [x] Configure `app.json` (name: "Aether", slug: "aether-campus-os")
- [x] Set up `babel.config.js` with path aliases (`@components/`, `@services/`, `@hooks/`, `@store/`, `@constants/`)
- [x] Create `.env`:
  ```
  EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
  EXPO_PUBLIC_WS_URL=http://localhost:3000
  EXPO_PUBLIC_APP_NAME=Aether
  EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_PLACEHOLDER
  ```

### Design Tokens (constants/)

- [x] `constants/colors.ts`:
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
- [x] `constants/spacing.ts`:
  ```typescript
  export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
  ```
- [x] `constants/typography.ts`:
  ```typescript
  export const FONTS = {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  };
  ```

### Core Infrastructure

- [x] `services/api.ts` — Axios instance with:
  - Base URL from `EXPO_PUBLIC_API_BASE_URL`
  - Auth token interceptor (auto-inject `Authorization: Bearer <token>`)
  - Response interceptor for error handling
  ```typescript
  import axios from 'axios';
  import * as SecureStore from 'expo-secure-store';

  const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  });

  api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  export default api;
  ```
  > ⚠️ **ALL API calls in the entire app MUST go through this file.** Never use `fetch()` directly.

- [x] `hooks/useAuth.ts` — Auth hook: check JWT from `expo-secure-store`, redirect to login if missing
- [x] `hooks/useWebSocket.ts` — Socket.IO client hook (connect to `EXPO_PUBLIC_WS_URL`, auto-reconnect with `reconnectionDelay: 1000`)
- [x] `hooks/useNotifications.ts` — Expo Notifications setup + FCM push token registration
- [x] `store/auth.store.ts` — Zustand store: `user`, `token`, `setAuth()`, `clearAuth()`
- [x] `store/notifications.store.ts` — Zustand store: notifications list, unread count
- [x] `styles/global.ts` — Global StyleSheet with shared styles (no Tailwind)

### Common Components

- [x] `components/common/Button.tsx` — Primary/secondary/outline variants using design tokens
- [x] `components/common/Card.tsx` — Surface card with elevation using `COLORS.surface`
- [x] `components/common/Badge.tsx` — Status badges (pending/approved/rejected)
- [x] `components/common/Avatar.tsx` — User avatar circle
- [x] `components/common/LoadingSpinner.tsx` — Animated spinner with primary color
- [x] `components/common/NotificationBanner.tsx` — Push notification toast

### 🟢 PUSH CHECKPOINT A0
```bash
git add -A && git commit -m "feat: expo scaffold + design system + api layer + common components" && git push origin main
```
> Your push is safe — you're the only one touching `apps/mobile/`.

---

## Sprint 1 — Auth Screens + Dashboards

> ⏳ Wait for: **Sid's S1 push** (auth API endpoints live)

### Auth Screens

- [x] `app/_layout.tsx` — Root layout: check auth state, redirect to login or appropriate dashboard
  - 📐 Wireframe: `docs/wireframes/splash_screen/` — match the splash/loading state
- [x] `app/(auth)/login.tsx` — Login form (email + password). On success → store token in `expo-secure-store` → navigate to role-based dashboard
  - 📐 Wireframe: `docs/wireframes/login_screen/` — match layout, input styling, button colors from `screen.png`; read `code.html` for form validation behavior
- [x] `app/(auth)/role-select.tsx` — Role selection screen (if needed for demo: student/professor toggle)
  - 📐 Wireframe: `docs/wireframes/role_selector/` — match card layout and selection interaction from `screen.png`
- [x] `services/auth.service.ts` — `login()`, `register()`, `logout()`, `getMe()`, `updateLanguage()`

### Student Dashboard

- [x] `app/(student)/dashboard.tsx` — Student main screen with widget grid
  - 📐 Wireframe: `docs/wireframes/student_dashboard/` — match the full widget grid layout, card sizes, spacing, and color scheme from `screen.png`
- [x] `components/dashboard/NextClassWidget.tsx` — Shows next class location + time
- [x] `components/dashboard/KarmaScoreWidget.tsx` — Gold chip displaying karma score
  - 📐 Wireframe: `docs/wireframes/karma_score_leaderboard/` — match the karma chip style from `screen.png`
- [x] `components/dashboard/FinanceDueWidget.tsx` — Badge showing total pending dues amount
- [x] `components/dashboard/QuickActionsWidget.tsx` — Quick action buttons (Book Room, Report Issue, PYQ, Pay Dues)
- [x] `services/dashboard.service.ts` — `getStudentDashboard()`, `getProfessorDashboard()`, `getAdminDashboard()`

### Professor Dashboard

- [x] `app/(professor)/dashboard.tsx` — Professor main screen with:
  - 📐 Wireframe: `docs/wireframes/professor_dashboard/` — match the full layout from `screen.png`
  - [x] Attendance trends widget
  - [x] Pending leave approvals count
  - [x] Pending student follow-ups
  - [x] Recent notices published
  - [x] Quick action buttons (Mark Attendance, Publish Notice)

### WebSocket Integration on Dashboards

- [ ] Both dashboards must listen for WebSocket events and update widgets in real-time:
  - `approval:updated` → refresh pending count
  - `notice:new` → show a notification banner
  - `attendance:updated` → refresh trends widget

### 🟢 PUSH CHECKPOINT A1
```bash
git add -A && git commit -m "feat: auth screens + student/professor dashboards + widgets" && git push origin main
```

---

## Sprint 2 — Workflow + Copilot Screens

> ⏳ Wait for: **Dev's D1 push** (workflow API), then **Dev's D2 push** (copilot API)
> You can build the UI shells/mocks before the APIs are live, then wire them once Dev pushes.

### Workflow / Approvals Screens

- [ ] `services/approvals.service.ts` — `submitRequest()`, `getMyRequests()`, `getRequestById()`, `getPending()`, `approve()`, `reject()`
- [ ] `app/(student)/bookings/request.tsx` — Room booking form: date picker, time picker, room selector. On submit → POST `/api/workflow/request`
  - 📐 Wireframe: `docs/wireframes/submit_request/` — match form layout, field styling, submit button from `screen.png`; read `code.html` for form validation and submission behavior
- [ ] `app/(student)/bookings/status.tsx` — List of my requests + Swiggy-style progress bar for each
  - 📐 Wireframe: `docs/wireframes/track_request/` — match the progress tracker layout and status card design from `screen.png`
- [ ] `components/approvals/ApprovalProgressBar.tsx` — The hero component:
  - 3 named stages with status icons: ✅ approved · 🕐 pending · ❌ rejected
  - Must update in real-time via `approval:updated` WebSocket event
  - Animated transitions between stages
  - 📐 Wireframe: Refer to `docs/wireframes/track_request/screen.png` for the Swiggy-style step tracker visual
- [ ] `components/approvals/ApprovalCard.tsx` — Card showing request summary with progress bar embedded
- [ ] `app/(professor)/leave-approvals/index.tsx` — List of pending approval requests for professor. Each item has one-tap Approve/Reject buttons with optional note input
  - 📐 Wireframe: `docs/wireframes/approvals_queue/` — match the approval list layout, button styles, and queue design from `screen.png`

### AI Copilot Screens

- [ ] `hooks/useCopilot.ts` — Hook wrapping copilot API calls + session state
- [ ] `store/copilot.store.ts` — Zustand store: messages[], isLoading, proactiveAlerts[]
- [ ] `services/copilot.service.ts` — `sendMessage()`, `getSession()`, `getProactiveAlerts()`, `getLanguages()`
- [ ] `components/copilot/CopilotFAB.tsx` — Floating action button visible on ALL screens. Tapping opens copilot chat overlay
- [ ] `components/copilot/CopilotChat.tsx` — Chat interface:
  - 📐 Wireframe: `docs/wireframes/aether_copilot/` — match the chat bubble layout, input bar, FAB position, and overall chat UI from `screen.png`; read `code.html` for message animation and interaction behavior
  - Message bubbles (user + bot)
  - Text input at bottom
  - Loading animation while waiting for Grok response
  - Actionable step buttons in bot responses (tapping navigates to relevant screen)
  - Proactive alert cards at top of chat (fetched on mount via `getProactiveAlerts()`)
- [ ] `components/copilot/LanguageToggle.tsx` — Dropdown to switch preferred language (en/hi/ta/mr/te). Calls `PATCH /api/auth/language`
- [ ] `app/(student)/copilot/index.tsx` — Full-screen copilot chat (alternative to FAB overlay)
  - 📐 Wireframe: `docs/wireframes/aether_copilot/` — same wireframe as CopilotChat

### 🟢 PUSH CHECKPOINT A2
```bash
git add -A && git commit -m "feat: workflow screens + swiggy progress bar + AI copilot UI" && git push origin main
```

---

## Sprint 3 — Issues, Heatmap, Calendar, Finance, PYQ

> ⏳ Wait for: **Het's H1 push** (issues + attendance APIs), then **Het's H2 push** (finance + PYQ APIs), then **Dev's D3 push** (calendar API)
> Build UI shells first, wire APIs as they come online.

### Issues + Heatmap

- [ ] `services/issues.service.ts` — `reportIssue()` (multipart form), `getIssues()`, `getHeatmap()`
- [ ] `app/(student)/issues/report.tsx` — Issue reporting form:
  - 📐 Wireframe: `docs/wireframes/report_an_issue/` — match form layout, camera button placement, category picker style from `screen.png`; read `code.html` for upload and submission behavior
  - Title, description, category picker
  - Building selector
  - Camera button → Expo Camera or Image Picker → attach photo
  - Submit → multipart POST to `/api/issues`
- [ ] `app/(student)/issues/heatmap.tsx` — Campus heatmap screen:
  - 📐 Wireframe: `docs/wireframes/campus_issue_heatmap/` — match the map layout, dot colors, legend, and overlay style from `screen.png`
  - React Native Maps with overlay dots
  - Color-coded by issue category / density
  - Real-time updates via `heatmap:update` WebSocket event (new dot appears live)
- [ ] `components/heatmap/CampusHeatmap.tsx` — Reusable map component with heatmap layer

### Calendar + Clash Detection

- [ ] `services/calendar.service.ts` — `getEvents()`, `getRooms()`, `bookRoom()`, `checkClash()`, `getSuggestions()`
- [ ] `app/(student)/calendar/index.tsx` — Calendar view:
  - 📐 Wireframe: `docs/wireframes/calendar_view/` — match the calendar grid layout, event pill colors, and day detail view from `screen.png`
  - Monthly/weekly calendar display
  - Events color-coded: class (blue), event (purple), room_booking (green)
  - Tap a day → see events list
  - Room availability view
  - When booking triggers clash → show 3 suggestions from smart suggestions API
  - 📐 Wireframe: `docs/wireframes/clash_detection_warning/` — match the clash warning modal layout, suggestion cards, and button styles from `screen.png`
- [ ] `utils/clash-detection.ts` — Client-side pre-check before submitting (optional, server is authoritative)

### Finance + Payment

- [ ] `services/finance.service.ts` — `getDues()`, `initiatePayment()`, `verifyPayment()`
- [ ] `app/(student)/finance/index.tsx` — Dues list screen:
  - 📐 Wireframe: `docs/wireframes/finance_dues/` — match the dues list card layout, amount styling, and "Pay Now" button from `screen.png`; read `code.html` for payment interaction flow
  - Itemized dues by type (library, canteen, lab)
  - Total amount displayed
  - "Pay Now" button per item
- [ ] `app/(student)/finance/payment.tsx` — Razorpay checkout flow:
  - Initiate order → open Razorpay → on success → verify → show confirmation
  - On failure → show error + retry

### PYQ

- [ ] `services/pyq.service.ts` — `searchPapers()`, `getPaperById()`
- [ ] `app/(student)/pyq/index.tsx` — Paper search + results screen:
  - 📐 Wireframe: `docs/wireframes/pyq_discovery/` — match the search bar, filter pills, results card layout, and download button from `screen.png`
  - Search bar with subject/year filters
  - Results list with paper metadata
  - Download button per paper

### 🟢 PUSH CHECKPOINT A3
```bash
git add -A && git commit -m "feat: issues + heatmap + calendar + finance + pyq screens" && git push origin main
```

---

## Sprint 4 — Faculty Workspace + Admin Analytics + Polish

> ⏳ Wait for: **Het's H1 push** (attendance API done), **Dev's D4 push** (analytics + karma APIs)

### Faculty Workspace

- [ ] `services/attendance.service.ts` — `markAttendance()`, `getClassAttendance()`, `getStudentSummary()`, `getTrends()`
- [ ] `app/(professor)/attendance/index.tsx` — Attendance marking screen:
  - 📐 Wireframe: `docs/wireframes/attendance_marking/` — match the class selector, student list toggle design, and submit button from `screen.png`; read `code.html` for toggle interaction and bulk submit behavior
  - Class selector dropdown
  - Student list with Present/Absent toggle per student
  - Bulk submit button
  - Must complete for 30 students in under 60 seconds (UX critical)
- [ ] `app/(professor)/follow-ups/index.tsx` — Student follow-up screen:
  - List of flagged students with notes
  - Add new flag + note form
- [ ] `app/(professor)/notices/index.tsx` — Notice publishing screen:
  - 📐 Wireframe: `docs/wireframes/notice_publisher/` — match the form layout, text area styling, and role/department selectors from `screen.png`
  - Title + content text area
  - Target role selector (student/all)
  - Department selector
  - Publish button → POST `/api/notices`

### Admin Analytics

- [ ] `services/analytics.service.ts` — `getAttendanceTrends()`, `getApprovalBottlenecks()`, `getIssueStats()`
- [ ] `services/karma.service.ts` — `getScore()`, `getLeaderboard()`
- [ ] `app/(admin)/analytics.tsx` — Admin dashboard:
  - 📐 Wireframe: `docs/wireframes/admin_dashboard_overview/` — match the overall admin layout from `screen.png`
  - Approval delay chart (bar chart showing avg time per stage)
    - 📐 Wireframe: `docs/wireframes/approval_analytics/` — match chart style, bottleneck highlight from `screen.png`
  - Issue resolution stats (pie chart: open/in_progress/resolved)
    - 📐 Wireframe: `docs/wireframes/issue_analytics/` — match chart style and breakdown cards from `screen.png`
  - Attendance trend lines by department
    - 📐 Wireframe: `docs/wireframes/attendance_analytics/` — match trend line chart design from `screen.png`
  - Bottleneck callout: "Stucco is averaging 3.2 day delays"
  - Nudge button (sends notification to bottleneck user)

### Final Polish

- [ ] Ensure CopilotFAB appears on EVERY screen (include in root layout)
- [ ] Verify all WebSocket events are handled across all screens
- [ ] Smooth screen transitions and loading states
- [ ] Error states for all API failures (no white screens)
- [ ] Pull-to-refresh on list screens

### 🟢 PUSH CHECKPOINT A4
```bash
git add -A && git commit -m "feat: faculty workspace + admin analytics + copilot everywhere + polish" && git push origin main
```

---

## 🔴 CRITICAL RULES — Review Before Every Commit

1. **NO Tailwind CSS.** Use `StyleSheet.create({})` only. All colors from `constants/colors.ts`, spacing from `constants/spacing.ts`.
2. **NO `fetch()` in components.** ALL API calls go through `services/api.ts` → specific service files.
3. **NO inline styles with hardcoded values.**
   ```typescript
   // ❌ WRONG
   <View style={{ backgroundColor: '#1a1a2e', padding: 16 }} />
   // ✅ RIGHT
   <View style={styles.container} />
   const styles = StyleSheet.create({
     container: { backgroundColor: COLORS.surface, padding: SPACING.md }
   });
   ```
4. **Expo Go compatible packages ONLY.** No native builds.
5. **Auth tokens in `expo-secure-store`** — NEVER `AsyncStorage`.
6. **Environment variables prefixed `EXPO_PUBLIC_`.**

---

## ⚠️ Files You MUST NEVER Touch

```
# Sid's files
package.json (root)
packages/shared-types/*
apps/backend/*
scripts/*

# Het's files
apps/super-app/*
apps/canteen-tracker/*
libs/aether-bridge/*
docs/developer-portal.md

# Dev's backend modules are also off-limits — you only call their APIs
```

---

## Dependencies & Sync Points

| You depend on | For | When |
|---------------|-----|------|
| **Sid** | Scaffold + shared-types (type imports) | Pull after Sid's S0 push |
| **Sid** | Auth API live (login/register working) | Pull after Sid's S1 push |
| **Dev** | Workflow + Notices APIs (room booking, approvals, notices) | Pull after Dev's D1 push |
| **Dev** | Copilot API (chat, proactive alerts) | Pull after Dev's D2 push |
| **Dev** | Calendar API (events, clash, suggestions) | Pull after Dev's D3 push |
| **Dev** | Analytics + Karma APIs | Pull after Dev's D4 push |
| **Het** | Issues API (camera upload, heatmap data) | Pull after Het's H1 push |
| **Het** | Attendance API (mark, trends) | Pull after Het's H1 push |
| **Het** | Finance API (dues, Razorpay) | Pull after Het's H2 push |
| **Het** | PYQ API (search, download) | Pull after Het's H2 push |

| Who depends on you | What they need | Checkpoint |
|--------------------|----------------|------------|
| Nobody | You are the end consumer of all APIs | — |

> **TIP:** You can build UI shells with mock data first, then swap in real API calls as Dev and Het push their endpoints. This lets you work in parallel without being fully blocked.

---

## Quick Reference — API Endpoints You'll Call

| Screen | Service File | Endpoints |
|--------|-------------|-----------|
| Login | `auth.service.ts` | POST `/auth/login`, POST `/auth/register`, GET `/auth/me` |
| Dashboard | `dashboard.service.ts` | GET `/dashboard/student`, GET `/dashboard/professor` |
| Room Booking | `approvals.service.ts` | POST `/workflow/request`, GET `/workflow/requests` |
| Approval Status | `approvals.service.ts` | GET `/workflow/requests/:id`, POST `/workflow/requests/:id/approve` |
| Copilot | `copilot.service.ts` | POST `/copilot/chat`, POST `/copilot/proactive`, GET `/copilot/session` |
| Issue Report | `issues.service.ts` | POST `/issues` (multipart), GET `/issues/heatmap` |
| Calendar | `calendar.service.ts` | GET `/calendar/events`, POST `/calendar/book`, GET `/calendar/clash-check` |
| Finance | `finance.service.ts` | GET `/finance/dues`, POST `/finance/pay/:dueId`, POST `/finance/verify` |
| PYQ | `pyq.service.ts` | GET `/pyq/papers`, GET `/pyq/papers/:id` |
| Attendance | `attendance.service.ts` | POST `/attendance/mark`, GET `/attendance/trends` |
| Analytics | `analytics.service.ts` | GET `/analytics/attendance`, GET `/analytics/approvals`, GET `/analytics/issues` |
| Karma | `karma.service.ts` | GET `/karma/score`, GET `/karma/leaderboard` |
| Notices | (in approvals or separate) | POST `/notices`, GET `/notices` |
| Language | `auth.service.ts` | PATCH `/auth/language` |

---

## WebSocket Events You Must Handle

| Event | Where to Handle | Action |
|-------|----------------|--------|
| `approval:updated` | Booking Status screen + Student Dashboard | Update progress bar + refresh pending count widget |
| `issue:created` | Heatmap screen | Add new dot to map |
| `heatmap:update` | Heatmap screen | Re-render heatmap overlay |
| `notice:new` | All screens (via layout) | Show notification banner |
| `notification:push` | All screens (via layout) | Show push notification toast |
| `attendance:updated` | Professor Dashboard | Refresh attendance trends widget |
