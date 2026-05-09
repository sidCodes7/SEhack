# AquaSentinel — Low Level Design (LLD)

## 1. System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                       │
│  Port 5173                                                         │
├────────────────────────────────────────────────────────────────────┤
│  Pages:  Dashboard | ZoneDetail | KnowledgeGraph | Settings        │
│  State:  React Context + useReducer                                │
│  Comms:  REST (fetch) + SSE (EventSource) for real-time updates    │
└──────────────────────────┬─────────────────────────────────────────┘
                           │ HTTP / SSE
┌──────────────────────────▼─────────────────────────────────────────┐
│                        SERVER (Node.js + Express)                  │
│  Port 3001                                                         │
├────────────────────────────────────────────────────────────────────┤
│  Routes:  /api/zones | /api/readings | /api/agents | /api/alerts   │
│           /api/chat | /api/graph | /api/simulation | /api/email     │
│  Services: GrokClient | NeonDB | Neo4jClient | EmailRunner         │
│  Agents:  LangGraph.js Orchestrator (7 agents)                     │
└───┬──────────────┬──────────────┬──────────────┬──────────────────┘
    │              │              │              │
    ▼              ▼              ▼              ▼
┌────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
│Grok API│  │ Neon DB  │  │  Neo4j   │  │Python Scripts│
│x.ai/v1 │  │(Postgres)│  │(Aura)    │  │(email_alert) │
└────────┘  └──────────┘  └──────────┘  └──────────────┘
```

---

## 2. API Routes

### 2.1 Zone Routes (`/api/zones`)

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| GET | `/api/zones` | Get all zones with current status | — | `Zone[]` with latest severity |
| GET | `/api/zones/:id` | Get single zone detail | — | `Zone` with full config |
| GET | `/api/zones/:id/readings` | Get readings for a zone | Query: `?from=&to=&limit=` | `Reading[]` |
| GET | `/api/zones/:id/anomalies` | Get anomalies for a zone | Query: `?status=active` | `Anomaly[]` |
| PATCH | `/api/zones/:id/sensitivity` | Update zone sensitivity (Learning Agent) | `{ sensitivity: 0.9 }` | Updated `Zone` |

### 2.2 Reading Routes (`/api/readings`)

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| GET | `/api/readings/latest` | Latest reading per zone | — | `Reading[]` (8 items) |
| GET | `/api/readings/timeseries` | Time-series for charting | Query: `?zone_id=&metric=&days=30` | `{ timestamps[], values[] }` |
| POST | `/api/readings/ingest` | Manual ingestion trigger | `{ zone_id, metrics }` | `{ processed: true, anomalies_found: N }` |

### 2.3 Agent Routes (`/api/agents`)

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| GET | `/api/agents/status` | Get all 7 agent statuses | — | `AgentStatus[]` |
| GET | `/api/agents/logs` | Agent activity log (timeline) | Query: `?limit=50` | `AgentLog[]` |
| POST | `/api/agents/run-pipeline` | Trigger full 7-agent pipeline | `{ zone_ids?: [] }` | SSE stream of agent events |
| GET | `/api/agents/metrics` | Agent performance metrics | — | `{ processed, suppressed, escalated }` |

### 2.4 Alert Routes (`/api/alerts`)

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| GET | `/api/alerts` | Get active alerts | Query: `?severity=&status=` | `Alert[]` ranked by score |
| GET | `/api/alerts/:id` | Get alert detail with reasoning | — | `Alert` with full brief |
| POST | `/api/alerts/:id/feedback` | Submit alert feedback | `{ was_valid: bool, notes: "" }` | `{ sensitivity_updated: true }` |
| GET | `/api/alerts/suppressed` | Get suppressed alert count/list | — | `{ count, alerts[] }` |
| GET | `/api/alerts/stats` | Noise reduction statistics | — | `{ total, suppressed, escalated, noise_pct }` |

### 2.5 Chat Routes (`/api/chat`)

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| POST | `/api/chat/query` | Natural language query | `{ message, zone_id? }` | SSE stream (Brief Agent response) |
| GET | `/api/chat/suggestions` | Pre-built quick queries | — | `string[]` |

### 2.6 Knowledge Graph Routes (`/api/graph`)

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| GET | `/api/graph/nodes` | Get all graph nodes | Query: `?type=Event\|Zone\|Metric` | `GraphNode[]` |
| GET | `/api/graph/edges` | Get all relationships | — | `GraphEdge[]` |
| GET | `/api/graph/zone/:id/subgraph` | Get subgraph for a zone | — | `{ nodes[], edges[] }` |
| GET | `/api/graph/correlations` | Get recent correlations | Query: `?hours=24` | `Correlation[]` |

### 2.7 Simulation Routes (`/api/simulation`)

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| POST | `/api/simulation/start` | Start auto-simulation loop | `{ interval_ms: 10000 }` | `{ session_id }` |
| POST | `/api/simulation/stop` | Stop simulation | — | `{ stopped: true }` |
| GET | `/api/simulation/status` | Current simulation state | — | `{ running, cycle, elapsed }` |

### 2.8 Email Routes (`/api/email`)

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| POST | `/api/email/send` | Send alert email | `{ anomaly_id, recipient }` | `{ sent: true, preview }` |
| GET | `/api/email/preview/:anomaly_id` | Preview email content | — | `{ subject, html_body }` |
| GET | `/api/email/logs` | Email dispatch history | — | `EmailLog[]` |

---

## 3. Page Flow & Interactions

### 3.1 Page Map

```
┌─────────────────────────────────────────────────────┐
│                    SINGLE PAGE APP                   │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  DASHBOARD (Main View — Default)             │    │
│  │  ┌───────────┬─────────────────┬──────────┐  │    │
│  │  │Agent Strip │                 │          │  │    │
│  │  ├───────────┤   MAP VIEW      │ SIDEBAR  │  │    │
│  │  │           │                 │ (Alerts  │  │    │
│  │  │           │                 │  + Chat) │  │    │
│  │  │           │                 │          │  │    │
│  │  ├───────────┴─────────────────┤          │  │    │
│  │  │  CHARTS STRIP               │          │  │    │
│  │  ├─────────────────────────────┴──────────┤  │    │
│  │  │  AUTOMATION TIMELINE                    │  │    │
│  │  └─────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  ZONE DETAIL (Overlay Panel — Click zone)    │    │
│  │  • Zone info + status                        │    │
│  │  • Full time-series charts (6 metrics)       │    │
│  │  • Active anomalies list                     │    │
│  │  • AI briefing for this zone                 │    │
│  │  • Historical events                         │    │
│  │  • Close → back to dashboard                 │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  KNOWLEDGE GRAPH (Toggleable Overlay)        │    │
│  │  • Force-directed graph visualization        │    │
│  │  • Filter by node type, time range           │    │
│  │  • Click node → highlight subgraph           │    │
│  │  • Close → back to dashboard                 │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  EMAIL PREVIEW (Modal)                       │    │
│  │  • Rendered HTML email preview               │    │
│  │  • Send / Cancel buttons                     │    │
│  │  • Recipient field                           │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  SETTINGS (Slide-out panel)                  │    │
│  │  • Zone sensitivity overrides                │    │
│  │  • Email configuration                       │    │
│  │  • Simulation speed control                  │    │
│  │  • Agent enable/disable toggles              │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 3.2 Component Interaction Diagram

```
User Action              Component          API Call                     Result
─────────────────────────────────────────────────────────────────────────────────
Page Load           →  Dashboard.jsx    →  GET /zones                →  Map populated
                    →  AgentStatusStrip →  GET /agents/status        →  Agent cards
                    →  AlertFeed        →  GET /alerts               →  Alert cards
                    →  ChartsStrip      →  GET /readings/timeseries  →  Charts render
                                                                    
Click "Start        →  Dashboard.jsx    →  POST /simulation/start    →  SSE stream opens
Monitoring"         →  AgentStatusStrip →  SSE /agents/run-pipeline  →  Agent cards update
                    →  Timeline         →  GET /agents/logs          →  Timeline populates

Click Zone Marker   →  MapView.jsx      →  GET /zones/:id            →  ZoneDetail opens
                    →  ZoneDetail.jsx   →  GET /zones/:id/readings   →  Zone charts
                                       →  GET /zones/:id/anomalies  →  Anomaly list
                                       →  GET /graph/zone/:id/sub.. →  Mini graph

Type Chat Query     →  ChatPanel.jsx    →  POST /chat/query (SSE)    →  Streaming response

Click Alert Card    →  AlertCard.jsx    →  GET /alerts/:id           →  Expanded detail

Submit Feedback     →  AlertCard.jsx    →  POST /alerts/:id/feedback →  Sensitivity toast

Open Graph View     →  GraphPanel.jsx   →  GET /graph/nodes          →  Full graph
                                       →  GET /graph/edges          →  Edges rendered

Email Alert Fires   →  EmailPreview.jsx →  GET /email/preview/:id    →  Preview modal
                                       →  POST /api/email/send      →  Send confirmation
```

### 3.3 Real-Time Update Flow (SSE)

```
Server                                          Client
  │                                                │
  │  SSE: /api/agents/run-pipeline                 │
  │  ─────────────────────────────────────────▶     │
  │                                                │
  │  event: agent_status                           │
  │  data: {agent:"ingestion",status:"processing"} │
  │  ─────────────────────────────────────────▶     │  → AgentCard turns 🔄
  │                                                │
  │  event: reading_ingested                       │
  │  data: {zone_id:"Z1", metrics:{...}}           │
  │  ─────────────────────────────────────────▶     │  → Charts update
  │                                                │
  │  event: anomaly_detected                       │
  │  data: {zone_id:"Z1",type:"thermal",score:87}  │
  │  ─────────────────────────────────────────▶     │  → Map marker changes
  │                                                │
  │  event: correlation_found                      │
  │  data: {from:"Z3",to:"Z4",type:"preceded_by"}  │
  │  ─────────────────────────────────────────▶     │  → Graph edge animates
  │                                                │
  │  event: alert_suppressed                       │
  │  data: {anomaly_id:12,reason:"low confidence"} │
  │  ─────────────────────────────────────────▶     │  → Suppressed counter++
  │                                                │
  │  event: alert_escalated                        │
  │  data: {anomaly_id:5,severity:"critical"}      │
  │  ─────────────────────────────────────────▶     │  → AlertCard slides in
  │                                                │
  │  event: brief_generated                        │
  │  data: {zone_id:"Z1",brief:"Sustained..."}    │
  │  ─────────────────────────────────────────▶     │  → Briefing card appears
  │                                                │
  │  event: email_dispatched                       │
  │  data: {to:"ops@aqua.io",subject:"CRITICAL"}  │
  │  ─────────────────────────────────────────▶     │  → Email toast
  │                                                │
  │  event: sensitivity_updated                    │
  │  data: {zone_id:"Z5",old:1.0,new:0.9}         │
  │  ─────────────────────────────────────────▶     │  → Learning toast
  │                                                │
  │  event: cycle_complete                         │
  │  data: {cycle:1,next_in_ms:10000}              │
  │  ─────────────────────────────────────────▶     │  → Timeline entry
```

---

## 4. Database Design

### 4.1 Neon Postgres — ERD

```
┌──────────────────┐     ┌─────────────────────┐
│      zones       │     │     readings        │
├──────────────────┤     ├─────────────────────┤
│ id (PK)          │◄────│ zone_id (FK)        │
│ name             │     │ id (PK)             │
│ region           │     │ timestamp           │
│ lat, lng         │     │ sst                 │
│ polygon (JSONB)  │     │ chlorophyll         │
│ baseline (JSONB) │     │ dissolved_o2        │
│ sensitivity      │     │ turbidity, ph       │
└──────┬───────────┘     │ salinity            │
       │                 │ wind_speed          │
       │                 │ wave_height         │
       │                 │ sea_level_anomaly   │
       │                 └─────────────────────┘
       │
       │    ┌──────────────────┐     ┌──────────────────┐
       │    │   anomalies      │     │  alert_outcomes   │
       │    ├──────────────────┤     ├──────────────────┤
       └────│ zone_id (FK)     │     │ id (PK)          │
            │ id (PK)          │◄────│ anomaly_id (FK)  │
            │ detected_at      │     │ was_valid        │
            │ anomaly_type     │     │ feedback_notes   │
            │ severity         │     │ feedback_at      │
            │ confidence       │     └──────────────────┘
            │ score            │
            │ reasoning        │     ┌──────────────────┐
            │ status           │     │   agent_logs     │
            │ suppressed_by    │     ├──────────────────┤
            │ resolved_at      │     │ id (PK)          │
            └──────┬───────────┘     │ agent_name       │
                   │                 │ action           │
                   │                 │ input_summary    │
                   │                 │ output_summary   │
            ┌──────┴───────────┐     │ processing_ms    │
            │   email_logs     │     │ timestamp        │
            ├──────────────────┤     └──────────────────┘
            │ id (PK)          │
            │ anomaly_id (FK)  │
            │ recipient        │
            │ subject          │
            │ body             │
            │ sent_at          │
            │ status           │
            └──────────────────┘
```

### 4.2 Neo4j Graph Schema

```
Node Types:
  (:Zone)    — {id, name, region, lat, lng}
  (:Event)   — {id, type, severity, detected_at, confidence, zone_id}
  (:Metric)  — {name, unit}  // SST, Chlorophyll, DO, pH, etc.
  (:Alert)   — {id, message, level, sent_at}

Relationships:
  (:Event)-[:OCCURRED_IN]->(:Zone)
  (:Event)-[:TRIGGERED_BY]->(:Metric)
  (:Event)-[:PRECEDED_BY {time_delta_hours}]->(:Event)
  (:Event)-[:CORRELATED_WITH {confidence}]->(:Event)
  (:Event)-[:CAUSED]->(:Alert)
  (:Zone)-[:ADJACENT_TO {distance_km, current_connected}]->(:Zone)
```

---

## 5. Agent Pipeline — Detailed Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  LangGraph State Machine                     │
│                                                              │
│  State = {                                                   │
│    readings: Reading[],        // raw input                  │
│    normalized: NormReading[],  // after ingestion            │
│    anomalies: Anomaly[],       // after detection            │
│    correlations: Correlation[],// after correlation          │
│    triaged: TriagedAlert[],    // after triage               │
│    briefs: Brief[],            // after briefing             │
│    dispatches: Dispatch[],     // after dispatch             │
│    feedback: Feedback[],       // learning inputs            │
│    agent_logs: AgentLog[]      // activity log               │
│  }                                                           │
│                                                              │
│  Flow:                                                       │
│  START → ingest → detect → correlate → triage ──┬── brief   │
│                                                  └── dispatch│
│                                                       │      │
│                                                       ▼      │
│                                                    learn     │
│                                                       │      │
│                                                       ▼      │
│                                                      END     │
└─────────────────────────────────────────────────────────────┘
```

### Agent Input/Output Contracts

| Agent | Input | Output | Type |
|---|---|---|---|
| 📡 Ingestion | `{ readings: RawReading[] }` | `{ normalized: NormReading[], quality_flags[] }` | LLM |
| 🔍 Detection | `{ normalized[], baselines[] }` | `{ anomalies: Anomaly[] }` with scores and reasoning | LLM |
| 🔗 Correlation | `{ anomalies[], zone_adjacency[] }` | `{ correlations: {from, to, type, confidence}[] }` | Rule |
| ⚖️ Triage | `{ anomalies[], correlations[], history[] }` | `{ escalated[], suppressed[], watch[] }` | LLM |
| 📋 Brief | `{ escalated[], correlations[] }` | `{ briefs: {zone, summary, actions, impact}[] }` | LLM |
| 🚨 Dispatch | `{ escalated[], briefs[] }` | `{ emails_sent[], dashboard_updates[] }` | Rule |
| 🧠 Learning | `{ feedback[], zone_sensitivities[] }` | `{ updated_sensitivities[] }` | Rule |

---

## 6. Frontend Component Tree

```
App.jsx
├── Header.jsx
│   ├── Logo + Title
│   ├── SimulationControls (Start/Stop/Speed)
│   ├── NotificationBell
│   └── SettingsToggle
│
├── AgentStatusStrip.jsx
│   └── AgentCard.jsx (×7)
│       ├── Icon + Name
│       ├── Status indicator (🟢🔄💤🔴)
│       ├── Last run time
│       └── Messages processed count
│
├── MainContent (CSS Grid)
│   ├── MapView.jsx (60% width)
│   │   ├── React-Leaflet MapContainer
│   │   ├── ZonePolygons.jsx (GeoJSON overlay)
│   │   ├── HeatmapLayer.jsx (Leaflet.heat)
│   │   ├── PulsingMarker.jsx (per zone, color = severity)
│   │   └── MapLegend.jsx
│   │
│   ├── Sidebar.jsx (25% width)
│   │   ├── TabSwitcher (Alerts | Chat)
│   │   ├── AlertFeed.jsx
│   │   │   ├── AlertCard.jsx (×N)
│   │   │   │   ├── Severity badge + zone name
│   │   │   │   ├── Confidence bar
│   │   │   │   ├── Reasoning (expandable)
│   │   │   │   └── Feedback buttons (✅❌)
│   │   │   └── SuppressedCounter.jsx
│   │   │
│   │   └── ChatPanel.jsx
│   │       ├── ChatMessage.jsx (×N)
│   │       ├── QuickQueryButtons.jsx
│   │       └── ChatInput.jsx
│   │
│   └── ChartsStrip.jsx (bottom 15%)
│       ├── TimeSeriesChart.jsx
│       ├── AlertVolumeBar.jsx
│       ├── ConfidenceRadial.jsx
│       ├── NoiseReductionDonut.jsx
│       └── AgentActivityBar.jsx
│
├── AutomationTimeline.jsx (bottom bar)
│   └── TimelineEvent.jsx (×N, horizontal scroll)
│
├── ZoneDetail.jsx (overlay panel, conditional)
│   ├── ZoneHeader (name, status, sensitivity)
│   ├── MetricSparklines.jsx (×8 metrics)
│   ├── ZoneAnomalyList.jsx
│   ├── ZoneBriefing.jsx
│   └── CloseButton
│
├── GraphPanel.jsx (overlay, conditional)
│   ├── ForceGraph2D (react-force-graph)
│   ├── GraphFilters.jsx
│   └── CloseButton
│
├── EmailPreview.jsx (modal, conditional)
│   ├── RenderedEmail
│   ├── RecipientField
│   └── Send/Cancel buttons
│
└── SettingsPanel.jsx (slide-out, conditional)
    ├── ZoneSensitivitySliders
    ├── EmailConfig
    ├── SimulationSpeed
    └── AgentToggles
```

---

## 7. Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| SPA vs MPA | Single Page App | One view = mission control, no navigation needed |
| State management | React Context + useReducer | Simple enough for this scope, no Redux overhead |
| Real-time updates | Server-Sent Events (SSE) | Simpler than WebSocket, unidirectional is sufficient |
| CSS architecture | BEM naming + CSS custom properties | Organized, no build tool dependency |
| Chart library | Recharts | React-native, declarative, handles all chart types |
| Map rendering | React-Leaflet (Leaflet core) | Free, no API key, dark tile support |
| Graph visualization | react-force-graph-2d | Lightweight, handles Neo4j data well |
| API format | JSON REST | Standard, easy to debug |
| Email execution | Node `child_process.exec` → Python | Keeps email logic in Python scripts per requirement |
| Agent orchestration | LangGraph.js StateGraph | Proper state machine with typed state transitions |
