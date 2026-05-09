# AquaSentinel — Implementation Plan

## Executive Summary

Build a **dark-themed, mission-control-style environmental intelligence dashboard** powered by a **7-agent agentic architecture** using **Grok API + LangGraph.js**. The system autonomously ingests, analyzes, correlates, triages, explains, dispatches, and learns from environmental anomalies across monitored marine zones. Heavy emphasis on **visible automation** — the system should feel alive, autonomous, and self-driving during the demo.

> **24h Reality Check:** Your long-form vision (LSTM Autoencoders, XGBoost/SHAP, H3 grids) is a 2-week build. This spec distills the *demo-winning essence* into 24 hours. The LLM *is* the anomaly detector — Grok reasons over time-series patterns directly. Same demo impact, fraction of the build time.

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast HMR, great DX |
| **Styling** | Vanilla CSS (dark theme, glassmorphism) | No Tailwind, full control |
| **Charts** | Recharts | React-native, declarative, fast for dashboards |
| **Map** | React-Leaflet + Leaflet.heat | Free (no API key), heatmap plugin, dark tiles |
| **Graph Viz** | react-force-graph-2d | Neo4j knowledge graph visualization |
| **GenAI** | Grok 4.3 via OpenAI SDK (`https://api.x.ai/v1`) | Paid key, OpenAI-compatible, tool calling |
| **Agent Framework** | LangGraph.js | Supervisor pattern, state machine, hackathon-credible |
| **Backend** | Node.js + Express | API layer for agent orchestration |
| **Database** | Neon (Serverless Postgres) | Time-series sensor data, zone configs |
| **Knowledge Graph** | Neo4j Aura Free | Event relationships, causal chains |
| **Email Alerts** | Python scripts (smtplib / gmail) | Custom automation scripts, no SaaS dependency |
| **Deployment** | Vercel + Render (LAST STAGE ONLY) | Not in codebase — manual deploy at end |

---

## 7-Agent Architecture

The system uses a **supervisor-worker** pattern. 4 agents are LLM-powered (Grok), 3 are rule-based/hardcoded for speed and reliability. All 7 are visible in the UI as autonomous entities with status indicators.

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT ORCHESTRATOR (LangGraph.js)            │
│                    Supervisor Pattern — State Machine           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │ 📡 INGEST│──▶│🔍 DETECT │──▶│🔗 CORRELATE──▶│⚖️ TRIAGE │    │
│  │ (LLM)    │   │ (LLM)    │   │ (RULE)   │   │ (LLM)    │    │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘    │
│                                                     │           │
│                                      ┌──────────────┼───────┐  │
│                                      ▼              ▼       │  │
│                                ┌──────────┐  ┌──────────┐   │  │
│                                │📋 BRIEF  │  │🚨 DISPATCH  │  │
│                                │ (LLM)    │  │ (RULE)   │   │  │
│                                └──────────┘  └──────────┘   │  │
│                                                     │       │  │
│                                                     ▼       │  │
│                                              ┌──────────┐   │  │
│                                              │🧠 LEARN  │   │  │
│                                              │ (RULE)   │   │  │
│                                              └──────────┘   │  │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Specifications

#### 🤖 LLM-Powered Agents (Grok 4.3)

| # | Agent | Role | Input | Output |
|---|---|---|---|---|
| 1 | **📡 Ingestion Agent** | Receives raw multi-source sensor data, normalizes into zone-level signals, detects missing/corrupt readings, fills gaps | Raw sensor readings JSON | Normalized zone signals with quality flags |
| 2 | **🔍 Detection Agent** | Analyzes time-series for anomalies — weighs recency, magnitude, historical trajectory, seasonal baselines. Outputs probabilistic scores | Normalized signals + historical baselines | Anomaly objects with scores 0-100, type classification, reasoning |
| 3 | **⚖️ Triage Agent** | Suppresses low-confidence/redundant alerts, ranks by convergent evidence, decides escalation level. Target: suppress 70% noise | All detected anomalies + zone context | Filtered + ranked alert list with escalation decisions |
| 4 | **📋 Brief Agent** | Generates natural-language briefings, action plans, answers operator queries. Produces structured, explainable responses | Triaged alerts + operator query | Markdown briefings, action recommendations, query answers |

#### ⚙️ Rule-Based Agents (Hardcoded Logic)

| # | Agent | Role | Logic | Why Rule-Based |
|---|---|---|---|---|
| 5 | **🔗 Correlation Agent** | Cross-zone pattern correlation — detects when anomalies in adjacent zones share causal relationships (e.g., upstream thermal → downstream hypoxia) | Adjacency matrix + temporal windowing: if Zone A anomaly type X detected within 48h of Zone B anomaly type Y, and zones are adjacent, create correlation edge in Neo4j | Deterministic graph logic is more reliable and faster than LLM |
| 6 | **🚨 Dispatch Agent** | Multi-channel alert routing — sends email via Python script, updates dashboard feed, triggers UI animations | Rule engine: Critical → email + dashboard + sound; Warning → dashboard + email; Watch → dashboard only | Routing logic doesn't need intelligence, just reliability |
| 7 | **🧠 Learning Agent** | Recalibrates detection sensitivity per zone based on alert outcome feedback. Adjusts zone sensitivity multiplier up/down | On feedback: if `was_valid=true`, increase sensitivity by 5%; if `was_valid=false`, decrease by 10%. Clamp to [0.3, 2.0]. Update zone baseline_config | Simple reinforcement signal — hardcoded math is transparent and explainable |

### Agent Status Dashboard (Automation Showcase)

Every agent has a visible status card in the UI showing:
- **Agent name + icon**
- **Status**: 🟢 Active / 🔄 Processing / 💤 Idle / 🔴 Error
- **Last run timestamp**
- **Messages processed count**
- **Current task description** (e.g., "Analyzing Zone 3 thermal readings...")
- **Processing time** for last run

This is KEY for the demo — judges see 7 autonomous agents working in real-time.

---

## Automation Showcase Features

> **Goal**: The system must feel like it's ALIVE and working autonomously. Even if some automation is simulated/accelerated, it must be visually convincing.

### 1. Auto-Ingestion Pipeline (Visible)
- Simulated data streams arrive every 10 seconds (accelerated from hourly)
- The Ingestion Agent card flashes 🔄, shows "Processing 8 zone readings..."
- A data flow animation shows packets moving from "Data Sources" to "Ingestion Agent"
- New readings appear on charts in real-time

### 2. Auto-Detection Cascade
- After ingestion, Detection Agent automatically activates
- Anomaly scores update on the map (marker colors shift)
- New anomalies animate into existence on the heatmap
- Detection Agent card shows "Found 3 anomalies, scoring..."

### 3. Auto-Correlation (Cross-Zone Intelligence)
- Correlation Agent automatically checks new anomalies against adjacency rules
- When a correlation is found, a new edge animates on the knowledge graph
- Toast notification: "🔗 Correlation detected: Zone 3 thermal → Zone 5 hypoxia"

### 4. Auto-Triage (Noise Suppression)
- Triage Agent processes all anomalies
- Suppressed alerts fade out with a "suppressed" label
- Running counter: "47 alerts suppressed (71% noise reduction)"
- Only high-confidence alerts flow to the alert feed

### 5. Auto-Briefing Generation
- Brief Agent auto-generates situation reports every cycle
- New briefing slides into the feed with a typewriter animation
- Each briefing is expandable: summary → full analysis → action items

### 6. Auto-Dispatch (Email + Dashboard)
- When critical alert detected, Dispatch Agent triggers:
  - 🔴 Alert card appears with urgency animation
  - 📧 "Email sent to ops@aquasentinel.io" notification with preview
  - Python script executes in background, confirmation toast appears
- Show email preview modal with formatted alert content

### 7. Auto-Learning (Feedback Loop)
- After an alert is resolved (user clicks ✅ Valid or ❌ False Positive):
  - Learning Agent card activates
  - Zone sensitivity meter visually adjusts
  - Toast: "🧠 Zone 3 sensitivity adjusted: 1.0 → 0.9 (false positive learned)"

### Automation Timeline View
A horizontal timeline at the bottom of the dashboard showing:
```
[10:00] 📡 Ingested 8 zones → [10:01] 🔍 3 anomalies detected → [10:01] 🔗 1 correlation found
→ [10:02] ⚖️ 2 suppressed, 1 escalated → [10:02] 📋 Briefing generated → [10:02] 🚨 Email dispatched
→ [10:03] 🧠 Sensitivity recalibrated
```

---

## Visualization Strategy

### Main Layout (Mission Control)
```
┌─────────────────────────────────────────────────────────────────┐
│  🔵 AquaSentinel    [Agent Status Strip — 7 agent cards]   🔔  │
├──────────────────────────────────┬──────────────────────────────┤
│                                  │                              │
│     INTERACTIVE MAP              │     ALERT FEED               │
│     (React-Leaflet + Heatmap)    │     (Priority-ranked cards)  │
│     60% width                    │     25% width                │
│                                  │                              │
│     - Dark Carto tiles           │     - Glassmorphic cards     │
│     - Zone polygons              │     - Severity color-coded   │
│     - Pulsing anomaly markers    │     - Expandable reasoning   │
│     - Heatmap overlay            │     - Suppress/resolve btns  │
│                                  │                              │
├──────────────────────────────────┤     AI CHAT                  │
│  CHARTS STRIP (bottom)           │     - NL query interface     │
│  Time-series | Bars | Radial     │     - Streaming responses    │
│  Sparklines | Prediction Cones   │     - Quick query buttons    │
├──────────────────────────────────┴──────────────────────────────┤
│  AUTOMATION TIMELINE (horizontal scroll)                        │
│  [📡 Ingested] → [🔍 Detected] → [🔗 Correlated] → [⚖️ Triaged]│
└─────────────────────────────────────────────────────────────────┘
```

### Chart Types (Recharts)

| # | Chart | Component | Data | Purpose |
|---|---|---|---|---|
| 1 | **Multi-line Time Series** | `<LineChart>` | SST, chlorophyll, dissolved O₂ per zone over 30 days | Show trends + anomaly highlights |
| 2 | **Anomaly Score Heatmap** | Custom CSS grid | Zone × Time matrix with color intensity | At-a-glance severity across all zones |
| 3 | **Alert Volume Stacked Bar** | `<BarChart>` | Alerts per zone: suppressed (gray) vs escalated (red) | Prove 70% noise reduction |
| 4 | **Confidence Radial Gauge** | `<RadialBarChart>` | Top-5 anomaly confidence scores | Visual wow factor |
| 5 | **Trend Sparklines** | `<AreaChart>` (mini) | 7-day trend per metric in zone detail panel | Dense data at a glance |
| 6 | **Prediction Cone** | `<AreaChart>` with gradient bands | Projected trajectory ± confidence interval | Forward-looking intelligence |
| 7 | **Agent Activity** | `<BarChart>` horizontal | Messages processed per agent per cycle | Show system is working |
| 8 | **Noise Reduction Donut** | `<PieChart>` | Suppressed vs escalated vs resolved | Key value metric |

### Knowledge Graph Panel (Toggleable)
- react-force-graph-2d rendering Neo4j relationships
- Nodes: Events (red), Zones (blue), Metrics (green), Alerts (orange)
- Edges: "caused_by", "correlated_with", "preceded_by"
- Animated: new edges pulse when created by Correlation Agent
- Click node → highlight connected subgraph

---

## Data Model

### Neon Postgres Schema

```sql
-- Monitored zones
CREATE TABLE zones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  lat DECIMAL(10, 6),
  lng DECIMAL(10, 6),
  polygon JSONB,
  baseline_config JSONB,
  sensitivity DECIMAL(3, 2) DEFAULT 1.0
);

-- Time-series sensor data
CREATE TABLE readings (
  id SERIAL PRIMARY KEY,
  zone_id INT REFERENCES zones(id),
  timestamp TIMESTAMPTZ NOT NULL,
  sst DECIMAL(5, 2),
  chlorophyll DECIMAL(8, 4),
  dissolved_o2 DECIMAL(5, 2),
  turbidity DECIMAL(6, 2),
  ph DECIMAL(4, 2),
  salinity DECIMAL(5, 2),
  wind_speed DECIMAL(5, 2),
  wave_height DECIMAL(4, 2)
);

-- Detected anomalies
CREATE TABLE anomalies (
  id SERIAL PRIMARY KEY,
  zone_id INT REFERENCES zones(id),
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  anomaly_type VARCHAR(50),
  severity VARCHAR(20),
  confidence DECIMAL(5, 2),
  score DECIMAL(5, 2),
  reasoning TEXT,
  status VARCHAR(20) DEFAULT 'active',
  suppressed_by VARCHAR(50),
  resolved_at TIMESTAMPTZ
);

-- Alert outcomes for learning agent
CREATE TABLE alert_outcomes (
  id SERIAL PRIMARY KEY,
  anomaly_id INT REFERENCES anomalies(id),
  was_valid BOOLEAN,
  feedback_notes TEXT,
  feedback_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent activity log (for timeline + status)
CREATE TABLE agent_logs (
  id SERIAL PRIMARY KEY,
  agent_name VARCHAR(50) NOT NULL,
  action VARCHAR(100),
  input_summary TEXT,
  output_summary TEXT,
  processing_time_ms INT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Email dispatch log
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  anomaly_id INT REFERENCES anomalies(id),
  recipient VARCHAR(255),
  subject VARCHAR(255),
  body TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'sent'
);
```

### Neo4j Graph Model

```cypher
(:Zone {id, name, region, lat, lng})
(:Event {id, type, severity, detected_at, confidence})
(:Metric {name, unit})
(:Alert {id, message, escalation_level, sent_at})

(:Event)-[:OCCURRED_IN]->(:Zone)
(:Event)-[:TRIGGERED_BY]->(:Metric)
(:Event)-[:PRECEDED_BY]->(:Event)
(:Event)-[:CORRELATED_WITH]->(:Event)
(:Event)-[:CAUSED]->(:Alert)
(:Zone)-[:ADJACENT_TO]->(:Zone)
```

---

## Email Alert System (Python Scripts)

Instead of Resend, use Python scripts for email automation:

```
/scripts/
  email_alert.py        # Main email sender (smtplib + Gmail App Password)
  email_templates.py    # HTML email templates for different severity levels
  test_email.py         # Quick test script
```

### Email Flow
1. Dispatch Agent (rule-based) determines an alert needs email
2. Backend calls Python script via `child_process.exec()`
3. Python script formats HTML email from template + alert data
4. Sends via Gmail SMTP (or any SMTP provider)
5. Logs result back to `email_logs` table
6. Frontend shows email preview modal + "sent" confirmation

### Email Template Levels
- **🔴 CRITICAL**: Red header, immediate action required, includes map screenshot link
- **🟠 WARNING**: Orange header, monitor closely, includes trend chart summary
- **🟡 WATCH**: Yellow header, FYI, includes brief summary

---

## Synthetic Data Strategy

### Demo Scenario: "The Arabian Sea Crisis"

8 monitored zones along the Indian Ocean coast. 30 days of synthetic data:

| Zone | Name | Scenario | Demo Purpose |
|---|---|---|---|
| 1 | Coral Bay | Slow thermal buildup, 0.3°C/day above baseline for 8 days | Slow-building anomaly (Req 1) |
| 2 | Mangrove Delta | Sudden chlorophyll spike, 3x baseline | Sudden spike detection (Req 1) |
| 3 | Deep Trench | Dissolved O₂ dropping steadily over 2 weeks | Temporal pattern modeling (Req 2) |
| 4 | Fishing Grounds | Normal but correlated with Zone 3 via currents | Cross-zone correlation |
| 5 | Reef Shelf | Chlorophyll noise that mimics bloom (false positive) | Adaptive learning (Req 3) |
| 6 | Port Harbor | pH anomaly from industrial runoff | Multi-metric convergence |
| 7 | Open Waters | Normal readings, minor natural variation | Noise suppression demo |
| 8 | Estuary | Normal readings | Noise suppression demo |

---

## Project Structure

```
aquasentinel/
├── client/                     # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── MapView.jsx
│   │   │   │   ├── ZonePolygons.jsx
│   │   │   │   ├── HeatmapLayer.jsx
│   │   │   │   └── PulsingMarker.jsx
│   │   │   ├── Charts/
│   │   │   │   ├── TimeSeriesChart.jsx
│   │   │   │   ├── AnomalyHeatmap.jsx
│   │   │   │   ├── AlertVolumeBar.jsx
│   │   │   │   ├── ConfidenceRadial.jsx
│   │   │   │   ├── TrendSparkline.jsx
│   │   │   │   ├── PredictionCone.jsx
│   │   │   │   ├── AgentActivity.jsx
│   │   │   │   └── NoiseReductionDonut.jsx
│   │   │   ├── Agents/
│   │   │   │   ├── AgentStatusStrip.jsx
│   │   │   │   └── AgentCard.jsx
│   │   │   ├── Alerts/
│   │   │   │   ├── AlertFeed.jsx
│   │   │   │   ├── AlertCard.jsx
│   │   │   │   └── EmailPreview.jsx
│   │   │   ├── Chat/
│   │   │   │   ├── ChatPanel.jsx
│   │   │   │   └── ChatMessage.jsx
│   │   │   ├── KnowledgeGraph/
│   │   │   │   └── GraphPanel.jsx
│   │   │   ├── Timeline/
│   │   │   │   └── AutomationTimeline.jsx
│   │   │   └── Layout/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Header.jsx
│   │   │       └── ZoneDetail.jsx
│   │   ├── hooks/
│   │   │   ├── useAgentStatus.js
│   │   │   ├── useAlerts.js
│   │   │   ├── useReadings.js
│   │   │   └── useChat.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── data/
│   │   │   ├── zones.js
│   │   │   └── mockReadings.js
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   ├── variables.css
│   │   │   ├── map.css
│   │   │   ├── charts.css
│   │   │   ├── agents.css
│   │   │   ├── alerts.css
│   │   │   ├── chat.css
│   │   │   └── animations.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Node.js Backend (Express)
│   ├── src/
│   │   ├── agents/
│   │   │   ├── orchestrator.js     # LangGraph state machine
│   │   │   ├── ingestionAgent.js   # LLM — data normalization
│   │   │   ├── detectionAgent.js   # LLM — anomaly scoring
│   │   │   ├── correlationAgent.js # RULE — cross-zone patterns
│   │   │   ├── triageAgent.js      # LLM — noise suppression
│   │   │   ├── briefAgent.js       # LLM — NL briefings
│   │   │   ├── dispatchAgent.js    # RULE — alert routing
│   │   │   └── learningAgent.js    # RULE — sensitivity tuning
│   │   ├── routes/
│   │   │   ├── agents.js
│   │   │   ├── zones.js
│   │   │   ├── readings.js
│   │   │   ├── alerts.js
│   │   │   ├── chat.js
│   │   │   └── graph.js
│   │   ├── services/
│   │   │   ├── grokClient.js       # OpenAI SDK → Grok
│   │   │   ├── neonDb.js           # Postgres connection
│   │   │   ├── neo4jClient.js      # Neo4j driver
│   │   │   └── emailRunner.js      # Spawns Python email script
│   │   ├── data/
│   │   │   └── seedData.js         # Synthetic data generator
│   │   └── index.js
│   └── package.json
│
├── scripts/                    # Python Scripts
│   ├── email_alert.py
│   ├── email_templates.py
│   ├── test_email.py
│   └── requirements.txt
│
├── implementation.md           # This file
└── PS.md                       # Problem statement
```

---

## Build Timeline (24 Hours)

### Phase 1: Foundation (Hours 0-3)
- [ ] Scaffold Vite + React project (`client/`)
- [ ] Scaffold Express project (`server/`)
- [ ] Set up dark theme CSS design system (variables, glassmorphism, typography)
- [ ] Create Neon DB and seed zone + reading tables with synthetic data
- [ ] Set up Neo4j Aura and seed graph model
- [ ] Set up Grok API client (OpenAI SDK, baseURL: `https://api.x.ai/v1`)
- [ ] Verify Grok API connectivity

### Phase 2: Core Dashboard UI (Hours 3-8)
- [ ] Build main layout: header + agent strip + map + sidebar + charts + timeline
- [ ] Implement React-Leaflet map with dark Carto tiles, zone polygons, pulsing markers
- [ ] Build heatmap overlay layer
- [ ] Create all 8 Recharts panels
- [ ] Build alert feed with glassmorphic cards
- [ ] Build agent status strip (7 agent cards with live status)
- [ ] Add micro-animations (pulse, slide, fade, typewriter)

### Phase 3: 7-Agent System (Hours 8-14)
- [ ] Implement LangGraph.js orchestrator with state machine
- [ ] Build 4 LLM agents (Ingestion, Detection, Triage, Brief)
- [ ] Build 3 rule-based agents (Correlation, Dispatch, Learning)
- [ ] Wire full pipeline: data in → 7 agents → alerts out
- [ ] Connect agent status updates to frontend via SSE/polling
- [ ] Test full pipeline with demo scenario

### Phase 4: Interactive + Automation (Hours 14-19)
- [ ] Build AI chat interface with streaming (Brief Agent backend)
- [ ] Implement auto-simulation mode (data arrives every 10s, agents auto-trigger)
- [ ] Build knowledge graph panel with animated edges
- [ ] Build automation timeline (horizontal event log)
- [ ] Implement Python email scripts + backend runner
- [ ] Add email preview modal in UI
- [ ] Build zone detail panel (click zone → expanded view with sparklines)
- [ ] Add alert feedback buttons (✅ Valid / ❌ False Positive → Learning Agent)

### Phase 5: Polish & Demo Prep (Hours 19-24)
- [ ] End-to-end demo flow testing
- [ ] Polish all animations, transitions, loading states
- [ ] Add "suppressed alerts" counter and noise reduction metrics
- [ ] Add sound effect for critical alerts (optional)
- [ ] Prepare demo script and talking points
- [ ] Record backup demo video
- [ ] Deploy to Vercel + Render (LAST)

---

## Key Demo Script (2-3 minutes)

1. **Open**: "Meet Aryan..." — show the problem. Dashboard loads with 8 zones.
2. **Automation starts**: Click "Start Monitoring" — agents light up one by one
3. **Ingestion**: Data flows in, Ingestion Agent processes, charts update live
4. **Detection**: Anomaly detected in Coral Bay — marker turns amber, score appears
5. **Correlation**: "Correlated with Deep Trench hypoxia" — knowledge graph edge animates
6. **Triage**: "47 alerts suppressed (71% noise reduction)" — suppressed alerts fade
7. **Briefing**: Auto-generated situation report slides into feed
8. **Query**: Type "What needs attention right now?" — AI responds with ranked list
9. **Escalation**: Critical alert fires — red pulse, email dispatched, preview shown
10. **Learning**: Mark false positive → sensitivity adjusts → "System learned"
11. **Close**: "From 45 minutes to 90 seconds. 7 autonomous agents. Zero manual handoffs."
