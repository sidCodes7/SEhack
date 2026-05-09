# 🎨 Het — Frontend Lead

> **Ownership:** `client/` (100% — every file in the client folder)
> **Tech:** React 18, Vite, Vanilla CSS, Recharts, React-Leaflet, react-force-graph-2d
> **Zero conflict zone:** Het never touches `server/`, `scripts/`, or `db/`

---

## Phase 1: Scaffold & Design System ✅ COMPLETE

- [x] Initialize Vite + React project in `client/`
- [x] Install dependencies: react-leaflet, leaflet, leaflet.heat, recharts, react-force-graph-2d
- [x] Create folder structure: components/(Map, Charts, Agents, Alerts, Chat, KnowledgeGraph, Timeline, Layout), hooks, services, data, styles
- [x] Create `styles/variables.css` — full color palette, typography, spacing tokens
- [x] Create `styles/index.css` — CSS reset, body styles, glass-card class, dark theme, Leaflet overrides
- [x] Create `styles/animations.css` — pulse-critical, slide-in-right, blink-cursor, agent-processing, flow-particle, shimmer, wave, glow-pulse
- [x] Import Google Font `Inter` and `JetBrains Mono` in `index.html`
- [x] Create `services/api.js` — all API call functions (REST + SSE, matches order.md contracts)
- [x] Create `data/zones.js` — 8 zone definitions with lat/lng/polygon/baseline/current, severity config, metric config, agent defs
- [x] Create `data/mockData.js` — mock alerts, alert stats, time series generators, timeline events, graph nodes/edges
- [ ] **GIT PUSH:** `feat/frontend-scaffold`

---

## Phase 2: Dashboard Layout & Map ✅ COMPLETE

- [x] Create `components/Layout/Header.jsx` + `styles/header.css`
  - Logo (animated wave CSS), title "AquaSentinel" with gradient text
  - Start/Stop simulation button (green/red)
  - Speed selector dropdown (Fast/Normal/Slow)
  - Knowledge Graph toggle button
  - Notification bell with badge counter (pulse animation)
  - Settings gear icon
- [x] Create dashboard layout in `App.jsx` + `styles/dashboard.css`
  - Flexbox layout: header → agent strip → (map + sidebar) → charts → timeline
  - All panels as glass-card containers
  - Responsive breakpoints at 1440px and 1024px
- [x] Create `components/Map/MapView.jsx` + `styles/map.css`
  - React-Leaflet `MapContainer` with dark Carto tiles
  - Center on Indian Ocean (12°N, 78°E), zoom level 5
  - Includes ZonePolygons, PulsingMarkers, HeatmapLayer, MapLegend
- [x] Create `components/Map/ZonePolygons.jsx`
  - Polygon overlay for 8 zones with teal stroke
  - Fill opacity scales with severity (0.05 normal → 0.3 critical)
  - Hover highlight, click → opens zone detail, tooltip with zone info
- [x] Create `components/Map/PulsingMarker.jsx`
  - CircleMarker at zone centers, color = severity
  - CSS pulse-critical animation for red zones
  - onClick → opens zone detail, tooltip with zone name + SST + severity
- [x] Create `components/Map/HeatmapLayer.jsx`
  - Leaflet.heat overlay with SST anomaly data
  - Gradient: blue → teal → yellow → orange → red
  - Deferred init (500ms) to avoid canvas errors
- [x] Create `components/Map/MapLegend.jsx` — glassmorphic severity legend
- [x] Create `components/Agents/AgentStatusStrip.jsx` + `styles/agents.css`
  - Horizontal flex row of 7 AgentCard components
  - Right-aligned: cycle counter + uptime in mono font
- [x] Create `components/Agents/AgentCard.jsx`
  - Props: name, icon, status, processed count
  - Status dot: active(green) / processing(spin) / idle(gray) / error(red)
  - `agent-processing` glow animation when processing
- [ ] **GIT PUSH:** `feat/dashboard-ui`

---

## Phase 3: Sidebar (Alerts + Chat) & Charts ✅ COMPLETE

- [x] Create `components/Alerts/AlertFeed.jsx` + `styles/alerts.css`
  - Scrollable list of AlertCard components
  - Bottom: suppressed counter with noise reduction %
- [x] Create `components/Alerts/AlertCard.jsx`
  - Glass card with left border = severity color (3px)
  - Zone name, alert type, confidence bar (gradient fill), timestamp
  - Expandable AI reasoning text
  - Feedback buttons: ✅ Valid / ❌ False Positive
  - `slide-in-right` animation on mount
- [x] Create sidebar tab switcher in App.jsx: [🔔 Alerts] [💬 Chat]
- [x] Create `components/Chat/ChatPanel.jsx` + `styles/chat.css`
  - Message list (scrollable, auto-scroll)
  - Quick query pill buttons: "What needs attention?", "Zone status summary", "Weekly trends", "Suppressed alerts", "Correlation report"
  - Input field with send button
  - Typewriter effect with blinking cursor for AI responses (mock for now)
  - User messages: right-aligned teal bubble; AI messages: left-aligned dark bubble
- [x] Create `components/Charts/TimeSeriesChart.jsx` + `styles/charts.css`
  - Recharts `<LineChart>` with multi-line (SST red, chlorophyll green, O₂ blue)
  - 30-day time axis, responsive container, dark tooltips
- [x] Create `components/Charts/AlertVolumeBar.jsx`
  - Recharts `<BarChart>` stacked: suppressed (gray) + escalated (red) per zone
- [x] Create `components/Charts/ConfidenceRadial.jsx`
  - Recharts `<RadialBarChart>` showing top-5 anomaly confidence scores
- [x] Create `components/Charts/NoiseReductionDonut.jsx`
  - Recharts `<PieChart>` donut — 71% noise cut center label
  - Animated fill on load
- [x] Create `components/Charts/AgentActivityBar.jsx`
  - Horizontal bar chart: messages processed per agent, color-coded
- [x] Create `components/Charts/ChartsStrip.jsx` — container for all 5 charts
- [ ] **GIT PUSH:** `feat/charts-alerts`

---

## Phase 4: Interactive Panels & Real-time — 🟡 PARTIAL

- [x] Create `components/Layout/ZoneDetail.jsx` + `styles/zone-detail.css`
  - Slide-in overlay panel (480px, from right) with backdrop dimmer
  - Zone header: name, icon, status badge (colored), region
  - Current readings grid (6 metrics with deviation arrows ▲▼→)
  - Active anomalies list with confidence + reasoning
  - AI briefing section (teal left border)
  - Action buttons: "Send Alert Email", "Ask AI"
  - Close button → slide out
- [x] Create `components/Charts/TrendSparkline.jsx`
  - Mini `<AreaChart>` for zone detail panel (per-metric 7-day sparklines)
- [x] Create `components/Charts/PredictionCone.jsx`
  - `<AreaChart>` with gradient bands showing forecast ± confidence interval
- [x] Create `components/KnowledgeGraph/GraphPanel.jsx` + `styles/graph.css`
  - Full-screen overlay with blur backdrop
  - react-force-graph-2d with custom node rendering (canvas API)
  - Node glow effect, color-coded: Zones(blue), Events(red), Metrics(green), Alerts(orange)
  - Directional particles on edges
  - Legend bar at bottom
  - Close button
- [x] Create `components/Alerts/EmailPreview.jsx`
  - Modal overlay with rendered email content (monospace)
  - Recipient input field
  - Send / Cancel buttons
- [x] Create `components/Timeline/AutomationTimeline.jsx` + `styles/timeline.css`
  - Horizontal scroll strip (40px height)
  - Connected dots with agent icons + timestamps
  - Color-coded by agent
- [x] Create `components/Layout/SettingsPanel.jsx`
  - Slide-in panel (360px) with backdrop dimmer
  - Simulation speed controls (Slow/Normal/Fast)
  - Auto-start toggle
  - Zone sensitivity sliders (8 zones, range 0-2)
  - Agent enable/disable toggles (7 agents)
- [x] Create `hooks/useAgentStatus.js`
  - SSE listener on `/api/agents/run-pipeline`
  - Parses events: agent_status, anomaly_detected, alert_escalated, etc.
  - Updates React state for all consuming components, builds timeline events
- [x] Create `hooks/useAlerts.js` — fetches /api/alerts + /api/alerts/stats, maps server→client format, feedback
- [x] Create `hooks/useReadings.js` — fetches /api/readings/timeseries, downsamples to daily averages, caches
- [x] Create `hooks/useChat.js` — SSE streaming for POST /api/chat/query, abort support, mock fallback
- [x] Wire everything in `App.jsx`: Dashboard layout with all panels, state management via useState
  - Simulation start/stop with agent cycling animation
  - Zone click → ZoneDetail overlay
  - Graph overlay toggle
  - Settings overlay toggle
  - Email preview modal from ZoneDetail
  - Sidebar tab switching (Alerts / Chat)
- [x] Create `components/Layout/ErrorBoundary.jsx` — class component with glassmorphic error UI + retry
- [x] Create `components/Layout/Skeleton.jsx` + `styles/skeleton.css` — SkeletonLine, SkeletonCard, SkeletonChart, SkeletonMap
- [ ] **GIT PUSH:** `feat/interactive`

---

## Phase 5: Polish & Demo Ready — 🟡 MOSTLY DONE

- [x] Add all micro-animations (reference `docs/ux-design.md` Animation section) — implemented in animations.css
- [x] Ensure glassmorphism renders correctly across panels — verified
- [x] Add loading states (skeleton screens) for all async data — SkeletonLine/Card/Chart/Map
- [x] Add error boundary component for graceful failures — ErrorBoundary with retry
- [x] Test responsive layout at 1440px, 1024px breakpoints — breakpoints in dashboard.css
- [x] Fine-tune chart colors, tooltips, and hover effects — dark tooltips, metric-specific colors
- [ ] Add sound effect for critical alert (optional — small mp3)
- [x] Final visual review: check all severity colors, text contrast, spacing — verified via browser testing
- [ ] **GIT PUSH:** `feat/polish`

---

## Dependencies on Other Team Members

| I need from | What | When |
|---|---|---|
| **Siddh** | API endpoints running on port 3001 | Phase 4 (for real data) |
| **Siddh** | SSE event format agreed | Before Phase 4 |
| **Dev** | Zone coordinate data (lat/lng/polygon) | Phase 2 (can use `data/zones.js` initially) |
| **Avani** | Agent names/icons/status format | Phase 2 (hardcode initially, wire later) |

## Packages Het Installs (client/package.json — Het owns this)
```
react, react-dom, react-leaflet, leaflet, leaflet.heat, recharts, react-force-graph-2d
```

## Current File Inventory (26 components + 4 hooks)
```
src/
├── App.jsx                              ✅ Root with hooks + state mgmt
├── main.jsx                             ✅ Entry point
├── components/
│   ├── Agents/AgentCard.jsx             ✅
│   ├── Agents/AgentStatusStrip.jsx      ✅
│   ├── Alerts/AlertCard.jsx             ✅
│   ├── Alerts/AlertFeed.jsx             ✅
│   ├── Alerts/EmailPreview.jsx          ✅
│   ├── Charts/AgentActivityBar.jsx      ✅
│   ├── Charts/AlertVolumeBar.jsx        ✅
│   ├── Charts/ChartsStrip.jsx           ✅
│   ├── Charts/ConfidenceRadial.jsx      ✅
│   ├── Charts/NoiseReductionDonut.jsx   ✅
│   ├── Charts/PredictionCone.jsx        ✅ Forecast with confidence band
│   ├── Charts/TimeSeriesChart.jsx       ✅
│   ├── Charts/TrendSparkline.jsx        ✅ Mini sparkline for zone detail
│   ├── Chat/ChatPanel.jsx              ✅ Props-driven via useChat
│   ├── KnowledgeGraph/GraphPanel.jsx    ✅
│   ├── Layout/ErrorBoundary.jsx         ✅ Class component with retry
│   ├── Layout/Header.jsx               ✅
│   ├── Layout/SettingsPanel.jsx         ✅
│   ├── Layout/Skeleton.jsx              ✅ Loading skeletons
│   ├── Layout/ZoneDetail.jsx            ✅
│   ├── Map/HeatmapLayer.jsx            ✅
│   ├── Map/MapLegend.jsx               ✅
│   ├── Map/MapView.jsx                 ✅
│   ├── Map/PulsingMarker.jsx           ✅
│   ├── Map/ZonePolygons.jsx            ✅
│   └── Timeline/AutomationTimeline.jsx  ✅
├── data/mockData.js                     ✅
├── data/zones.js                        ✅
├── hooks/
│   ├── useAgentStatus.js                ✅ SSE pipeline + timeline builder
│   ├── useAlerts.js                     ✅ REST fetch + feedback
│   ├── useChat.js                       ✅ SSE streaming + mock fallback
│   └── useReadings.js                   ✅ TimeSeries fetch + cache
├── services/api.js                      ✅
└── styles/ (14 files)                   ✅ All CSS complete + skeleton.css
```
