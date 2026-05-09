# AquaSentinel — UX/UI Design Specification

## Design Philosophy

**"Bloomberg Terminal meets NASA Mission Control for the Ocean."**

A data-dense, dark-themed, glassmorphic intelligence dashboard that feels like a premium professional tool — not a consumer app. Every pixel earns its place. Information density is high but never overwhelming because visual hierarchy, color coding, and micro-animations guide the eye.

**Inspirations:**
- Bloomberg Terminal — information density, dark theme, professional gravitas
- SpaceX Mission Control — real-time data streams, agent/system status strips
- Datadog/Grafana — chart layouts, alert management, dark dashboards
- Apple Weather — smooth animations, glassmorphism, data clarity
- Awwwards-winning dashboards — glassmorphic cards, gradient accents, fluid motion

---

## Design System

### Color Palette

```css
/* Core Background */
--bg-primary:     #050a18;     /* Deep space navy */
--bg-secondary:   #0a1628;     /* Slightly lighter navy */
--bg-tertiary:    #0f1f3d;     /* Card backgrounds */
--bg-glass:       rgba(15, 31, 61, 0.7);  /* Glassmorphism base */

/* Accent Colors */
--accent-primary:  #00d4aa;    /* Teal/cyan — primary brand */
--accent-secondary:#3b82f6;    /* Electric blue — links, interactive */
--accent-glow:     #00d4aa33;  /* Teal glow for effects */

/* Severity Colors */
--severity-critical: #ff3b5c;  /* Red — immediate danger */
--severity-warning:  #ff9f43;  /* Orange — elevated concern */
--severity-watch:    #ffd93d;  /* Yellow — monitoring */
--severity-normal:   #00d4aa;  /* Teal — all clear */
--severity-suppressed: #4a5568;/* Gray — noise */

/* Text */
--text-primary:    #e2e8f0;    /* Off-white for readability */
--text-secondary:  #94a3b8;    /* Muted for labels */
--text-dim:        #475569;    /* Very muted for metadata */

/* Chart Colors (per metric) */
--chart-sst:       #ff6b6b;    /* Warm red for temperature */
--chart-chlor:     #51cf66;    /* Green for chlorophyll */
--chart-o2:        #339af0;    /* Blue for dissolved oxygen */
--chart-ph:        #cc5de8;    /* Purple for pH */
--chart-turbidity: #ff922b;    /* Orange for turbidity */
--chart-salinity:  #20c997;    /* Seafoam for salinity */
```

### Typography

```css
/* Google Font: Inter (clean, professional, great at small sizes) */
--font-primary:  'Inter', -apple-system, sans-serif;
--font-mono:     'JetBrains Mono', 'Fira Code', monospace;

--text-xs:   0.65rem;   /* Agent metadata, timestamps */
--text-sm:   0.75rem;   /* Labels, secondary info */
--text-base: 0.875rem;  /* Body text — dense dashboard */
--text-lg:   1rem;       /* Section headers */
--text-xl:   1.25rem;    /* Panel titles */
--text-2xl:  1.5rem;     /* Page title */
--text-hero: 2.5rem;     /* Big numbers (anomaly score) */
```

### Glassmorphism

```css
.glass-card {
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

.glass-card:hover {
  border-color: rgba(0, 212, 170, 0.15);
  box-shadow: 0 4px 30px rgba(0, 212, 170, 0.08);
}
```

### Micro-Animations

```css
/* Pulse animation for active anomaly markers */
@keyframes pulse-critical {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 59, 92, 0.5); }
  50% { box-shadow: 0 0 0 12px rgba(255, 59, 92, 0); }
}

/* Slide-in for new alert cards */
@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Typewriter for AI chat responses */
@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Glow effect for agent processing */
@keyframes agent-processing {
  0%, 100% { box-shadow: 0 0 5px var(--accent-primary); }
  50% { box-shadow: 0 0 20px var(--accent-primary); }
}

/* Data flow particles (Ingestion Agent visual) */
@keyframes flow-particle {
  0% { transform: translateX(0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateX(200px); opacity: 0; }
}
```

---

## Page Designs

### Page 1: Dashboard (Main View)

**Purpose:** Single-screen mission control — the operator's entire world in one view.

#### Layout Grid

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER (48px height)                                            │
│ [🌊 Logo] AquaSentinel    [▶ Start] [Speed ▾] [🔔 3] [⚙️]     │
├─────────────────────────────────────────────────────────────────┤
│ AGENT STATUS STRIP (64px height)                                │
│ [📡 Ingest ●] [🔍 Detect ●] [🔗 Correlate ●] [⚖️ Triage ●]    │
│ [📋 Brief ●]  [🚨 Dispatch ●] [🧠 Learn ●]    [Cycle: 12]     │
├───────────────────────────────────┬─────────────────────────────┤
│                                   │                             │
│  MAP VIEW (flex: 3)               │  SIDEBAR (flex: 1, 320px)  │
│                                   │                             │
│  ┌─────────────────────────────┐  │  ┌───────────────────────┐  │
│  │  Dark Carto Tiles           │  │  │ [Alerts] [Chat]  tabs │  │
│  │                             │  │  ├───────────────────────┤  │
│  │  Zone polygons (teal        │  │  │                       │  │
│  │  outline, fill opacity      │  │  │  🔴 Lakshadweep       │  │
│  │  based on severity)         │  │  │  Thermal Anomaly      │  │
│  │                             │  │  │  Confidence: 87%      │  │
│  │  Pulsing markers at zone    │  │  │  ▓▓▓▓▓▓▓▓░░ 87%      │  │
│  │  centers (color = severity) │  │  │  [Expand] [✅] [❌]   │  │
│  │                             │  │  │                       │  │
│  │  Heatmap overlay showing    │  │  │  🟠 Kerala Upwelling  │  │
│  │  SST anomaly intensity     │  │  │  Hypoxia Warning      │  │
│  │                             │  │  │  Confidence: 72%      │  │
│  │  ┌──────────────────────┐   │  │  │  ▓▓▓▓▓▓▓░░░ 72%      │  │
│  │  │ MAP LEGEND           │   │  │  │  [Expand] [✅] [❌]   │  │
│  │  │ 🔴 Critical          │   │  │  │                       │  │
│  │  │ 🟠 Warning           │   │  │  │  ─── Suppressed: 47  │  │
│  │  │ 🟡 Watch             │   │  │  │  (71% noise reduced) │  │
│  │  │ 🟢 Normal            │   │  │  │                       │  │
│  │  └──────────────────────┘   │  │  └───────────────────────┘  │
│  └─────────────────────────────┘  │                             │
│                                   │                             │
├───────────────────────────────────┤                             │
│  CHARTS STRIP (height: 180px)     │  CHAT (when tab active)    │
│                                   │  ┌───────────────────────┐  │
│  ┌──────┐ ┌──────┐ ┌──────┐      │  │ 💬 What needs         │  │
│  │Time  │ │Alert │ │Noise │      │  │    attention now?      │  │
│  │Series│ │Volume│ │Donut │      │  │                       │  │
│  │📈    │ │📊    │ │🍩    │      │  │ 🤖 Based on current   │  │
│  └──────┘ └──────┘ └──────┘      │  │ analysis, 3 zones     │  │
│  ┌──────┐ ┌──────┐               │  │ require attention...  │  │
│  │Radial│ │Agent │               │  │                       │  │
│  │Gauge │ │Activ.│               │  │ [Quick queries ▾]     │  │
│  │🎯    │ │📊    │               │  │ [Type message...] [▶] │  │
│  └──────┘ └──────┘               │  └───────────────────────┘  │
├───────────────────────────────────┴─────────────────────────────┤
│ AUTOMATION TIMELINE (40px, horizontal scroll)                   │
│ ● 10:00 📡 Ingested → ● 10:01 🔍 3 anomalies → ● 10:01 🔗 1  │
│ correlation → ● 10:02 ⚖️ 2 suppressed → ● 10:02 📋 Brief →    │
│ ● 10:02 🚨 Email sent → ● 10:03 🧠 Sensitivity adjusted       │
└─────────────────────────────────────────────────────────────────┘
```

#### Component Details

**Header (48px)**
- Logo: Animated wave icon (CSS keyframe) + "AquaSentinel" in Inter 600
- Controls: Start/Stop button (green/red), speed selector dropdown, notification bell with badge count, settings gear
- Background: `var(--bg-secondary)` with subtle bottom border glow

**Agent Status Strip (64px)**
- 7 horizontal cards, equal width, glass-card style
- Each card: Icon | Name | Status dot (animated) | "12 processed" small text
- When processing: card border glows teal with `agent-processing` animation
- When idle: dim border, gray status dot
- Right side: "Cycle: 12 | Uptime: 2h 14m" in mono font

**Map View**
- Base tiles: Carto Dark (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`)
- Zone polygons: Teal stroke (`#00d4aa` at 40% opacity), fill opacity scales with severity (0.05 normal → 0.3 critical)
- Pulsing markers: Circle markers at zone center, 16px radius, color = severity, critical zones pulse with `pulse-critical` animation
- Heatmap: Leaflet.heat overlay showing SST anomaly intensity, gradient from blue → yellow → red
- On hover: Tooltip with zone name + current top metric + severity
- On click: Opens Zone Detail overlay

**Alert Feed**
- Glass cards, `slide-in-right` animation on new alerts
- Left border: 3px solid severity color
- Content: Zone name (bold), alert type, confidence bar (gradient fill), timestamp
- Expand: Shows full AI reasoning text
- Feedback: ✅ and ❌ icon buttons, trigger Learning Agent
- Bottom: "47 alerts suppressed (71% noise reduced)" in muted text with subtle animation

**Chat Panel**
- Messages: User messages right-aligned (teal bubble), AI responses left-aligned (dark bubble)
- AI responses: Typewriter effect with blinking cursor, markdown rendering
- Quick queries: Pill buttons — "What needs attention?", "Zone status", "Weekly trends"
- Input: Dark glass input with teal focus ring

**Charts Strip**
- 5 mini charts in a horizontal flex row
- Each in a glass card with title in small caps
- Hover: chart expands slightly (scale 1.02), shows detailed tooltip
- Time-series: Multi-line with metric-specific colors from palette
- Alert volume: Stacked bar (suppressed gray, escalated red)
- Noise donut: Animated fill on load
- Radial gauge: Top 5 anomaly scores as radial bars
- Agent activity: Horizontal bars showing messages per agent

**Automation Timeline**
- Horizontal scroll strip at very bottom (40px)
- Connected dots with agent icons and timestamps
- New events animate in from the right
- Dots color-coded by agent
- Click event → scrolls relevant panel into view

---

### Page 2: Zone Detail (Overlay Panel)

**Trigger:** Click zone marker on map
**Animation:** Slides in from right (480px wide), map dims slightly behind it

```
┌─────────────────────────────────────────┐
│  [✕ Close]                              │
│                                          │
│  🪸 LAKSHADWEEP CORAL REEF              │
│  Zone Z1 | Arabian Sea                   │
│  Status: 🔴 CRITICAL                     │
│  Sensitivity: ████████░░ 1.0             │
│                                          │
│  ─── CURRENT READINGS ───                │
│  🌡️ SST:        29.8°C  ▲ +1.8°C        │
│  🦠 Chlorophyll: 0.45    → baseline      │
│  💀 Dissolved O₂: 5.8    → baseline      │
│  ⚗️ pH:          8.05    → baseline      │
│  💧 Turbidity:   3.2     → baseline      │
│  🌊 Salinity:    35.1    → baseline      │
│                                          │
│  ─── 30-DAY TRENDS ───                   │
│  ┌──────────────────────────────────┐    │
│  │  SST ━━━━━━━━━━━╱╱╱ (rising)    │    │
│  │  Chlor ─────────────── (stable)  │    │
│  │  O₂   ─────────────── (stable)  │    │
│  │  ┈┈┈ Baseline                    │    │
│  │  ░░░ Prediction cone             │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ─── ACTIVE ANOMALIES ───                │
│  🔴 Thermal Anomaly (87% confidence)     │
│     "Sustained +1.8°C above baseline     │
│      for 8 consecutive days. DHW: 6.2.   │
│      Bleaching risk: HIGH."              │
│     [✅ Valid] [❌ False Positive]        │
│                                          │
│  ─── AI BRIEFING ───                     │
│  "Lakshadweep is experiencing a          │
│  sustained thermal stress event.         │
│  Current trajectory suggests DHW will    │
│  exceed 8°C-weeks within 4 days,         │
│  triggering mass bleaching..."           │
│                                          │
│  ─── RELATED EVENTS (Knowledge Graph) ── │
│  🔗 Connected to: Andaman Reef SST       │
│     anomaly (3 days prior)               │
│  🔗 Similar to: 2024 bleaching event     │
│     in same zone (confirmed)             │
│                                          │
│  [📧 Send Alert Email] [💬 Ask AI]       │
└─────────────────────────────────────────┘
```

---

### Page 3: Knowledge Graph (Overlay)

**Trigger:** Click "Knowledge Graph" button in header or from Zone Detail
**Animation:** Fades in as full-screen overlay with blurred dashboard behind

```
┌─────────────────────────────────────────────────────────────────┐
│  KNOWLEDGE GRAPH                                     [✕ Close]  │
│                                                                  │
│  Filters: [All ▾] [Events ▾] [Last 24h ▾]    Search: [____]   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  │         ○ SST Metric                                        ││
│  │        ╱                                                    ││
│  │  [Z1]─── ● Thermal Event ───[PRECEDED_BY]──── ● SST Event  ││
│  │  Zone     (Lakshadweep)                        (Andaman)    ││
│  │   │                                              │          ││
│  │   │                                             [Z5]        ││
│  │   │                                             Zone        ││
│  │   │                                                         ││
│  │  [Z3]─── ● Hypoxia Event ──[CORRELATED]── ● Fish Migration ││
│  │  Zone     (Kerala)                         (Fishing Grounds)││
│  │            │                                    │           ││
│  │            │                                   [Z4]         ││
│  │            ▼                                   Zone         ││
│  │         ◆ Alert                                             ││
│  │         (Email sent)                                        ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Legend:  ■ Zone (blue)  ● Event (red)  ○ Metric (green)        │
│           ◆ Alert (orange)                                       │
│  Edges:  ── OCCURRED_IN  ── TRIGGERED_BY  ── PRECEDED_BY        │
│           ── CORRELATED_WITH  ── CAUSED                          │
└─────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Nodes are draggable (force simulation)
- Hover node: highlights all connected edges + nodes
- Click node: shows detail tooltip (event details, zone info)
- New correlations animate in: edge draws with particle effect
- Zoom + pan with mouse wheel / drag
- Color-coded by node type

---

### Page 4: Email Preview (Modal)

**Trigger:** Dispatch Agent sends email OR user clicks "Send Alert Email"
**Animation:** Fade in centered modal with backdrop blur

```
┌─────────────────────────────────────────────────────────────┐
│  📧 EMAIL ALERT PREVIEW                         [✕ Close]   │
│                                                              │
│  To: [ops@aquasentinel.io          ]                        │
│  Subject: 🔴 CRITICAL | Lakshadweep: Thermal Anomaly        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │  AQUASENTINEL CRITICAL ALERT                 │    │   │
│  │  │  ════════════════════════════                 │    │   │
│  │  │                                              │    │   │
│  │  │  ZONE: Lakshadweep Coral Reef (Z1)           │    │   │
│  │  │  TYPE: Thermal Anomaly                       │    │   │
│  │  │  SEVERITY: ■■■ CRITICAL                      │    │   │
│  │  │  CONFIDENCE: 87%                             │    │   │
│  │  │                                              │    │   │
│  │  │  SITUATION                                   │    │   │
│  │  │  Sustained thermal stress: +1.8°C above      │    │   │
│  │  │  May baseline for 8 consecutive days...      │    │   │
│  │  │                                              │    │   │
│  │  │  RECOMMENDED ACTIONS                         │    │   │
│  │  │  1. Deploy monitoring buoys                  │    │   │
│  │  │  2. Alert reef management team               │    │   │
│  │  │  3. Increase satellite coverage              │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [Cancel]                               [📧 Send Email]     │
└─────────────────────────────────────────────────────────────┘
```

---

### Page 5: Settings (Slide-out Panel)

**Trigger:** Click gear icon in header
**Animation:** Slides in from right (360px)

```
┌──────────────────────────────────────┐
│  ⚙️ SETTINGS                  [✕]   │
│                                       │
│  ─── SIMULATION ───                   │
│  Speed:  [Slow] [Normal] [Fast]       │
│  Interval: [10s ▾]                    │
│  Auto-start: [Toggle ●]              │
│                                       │
│  ─── ZONE SENSITIVITIES ───          │
│  Z1 Lakshadweep:  ████████░░ 1.0     │
│  Z2 Gujarat:      ████████░░ 1.0     │
│  Z3 Kerala:       ███████░░░ 0.9     │
│  Z4 Mumbai:       ████████░░ 1.0     │
│  Z5 Andaman:      █████████░ 1.1     │
│  Z6 Sundarbans:   ████████░░ 1.0     │
│  Z7 Goa:          ██████░░░░ 0.8     │
│  Z8 Sri Lanka:    ████████░░ 1.0     │
│                                       │
│  ─── EMAIL ───                        │
│  SMTP Host: [smtp.gmail.com   ]      │
│  From:      [alerts@aqua.io   ]      │
│  Default To:[ops@aqua.io      ]      │
│  Test: [Send Test Email]             │
│                                       │
│  ─── AGENTS ───                       │
│  📡 Ingestion:   [Enabled ●]         │
│  🔍 Detection:   [Enabled ●]         │
│  🔗 Correlation: [Enabled ●]         │
│  ⚖️ Triage:      [Enabled ●]         │
│  📋 Brief:       [Enabled ●]         │
│  🚨 Dispatch:    [Enabled ●]         │
│  🧠 Learning:    [Enabled ●]         │
└──────────────────────────────────────┘
```

---

## Responsive Behavior

| Breakpoint | Layout Change |
|---|---|
| > 1440px | Full layout as designed, charts in single row |
| 1024-1440px | Charts wrap to 2 rows, sidebar narrows to 280px |
| 768-1024px | Sidebar collapses to bottom sheet (swipe up), map full width |
| < 768px | Not primary target (judges likely on desktop/laptop) — basic stacking |

---

## Key Interaction Patterns

| Interaction | Component | Animation | Duration |
|---|---|---|---|
| New alert arrives | AlertCard | `slide-in-right` + left border color flash | 400ms |
| Zone marker severity change | PulsingMarker | Color transition + pulse start/stop | 300ms transition |
| Agent starts processing | AgentCard | Border glow + status dot spin | 200ms in, continuous |
| AI chat response | ChatMessage | Typewriter text + blinking cursor | 30ms/char |
| Knowledge graph edge created | GraphPanel | Edge draws with particle trail | 800ms |
| Alert suppressed | AlertCard | Fade to gray + shrink | 500ms |
| Feedback submitted | AlertCard | Green/red flash + disappear | 300ms |
| Email sent | Toast notification | Slide up from bottom right | 300ms in, 3s hold |
| Cycle complete | Timeline | New dot slides in from right with line | 400ms |
| Zone detail open | ZoneDetail | Slide from right + map dims | 350ms |
