# AquaSentinel — Product Requirements Document (PRD)

## 1. Overview

### 1.1 Product Name
**AquaSentinel** — AI-Powered Environmental Intelligence Platform

### 1.2 Tagline
*"From 45 minutes to 90 seconds. 7 autonomous agents. Zero manual handoffs."*

### 1.3 Problem Statement
Marine policy analysts like Aryan pull reports from three different portals, manually compare satellite snapshots, and still miss slow-building anomalies. Static threshold alerts fire too late or too often, becoming noise. Environmental scientists, coastal administrators, fisheries regulators, and conservation NGOs struggle to convert freely available Earth observation data into timely, coherent situational awareness.

### 1.4 Solution
AquaSentinel is an AI-powered geospatial intelligence engine that autonomously ingests, interprets, and adapts based on observed spatio-temporal patterns. A 7-agent agentic architecture replaces manual handoffs with an autonomous "marine mind" — detecting anomalies, suppressing 70% of noise, generating natural language briefings, and continuously learning from operator feedback.

### 1.5 Target Users

| Persona | Role | Key Need |
|---|---|---|
| **Aryan** (Primary) | Marine Policy Analyst | Single-pane situational awareness, no portal-hopping |
| **Dr. Priya** | Environmental Scientist | Statistical anomaly detection with explainability |
| **Cmdr. Raj** | Coastal Administrator | Actionable alerts with recommended responses |
| **Meera** | Fisheries Regulator | Cross-zone correlation, impact on fishing grounds |
| **NGO Team** | Conservation Organization | Evidence-based advocacy, trend documentation |

---

## 2. Goals & Success Metrics

| Goal | Metric | Target |
|---|---|---|
| Reduce response time | Time from anomaly to operator awareness | < 90 seconds (from 45 min) |
| Reduce alert fatigue | Percentage of low-signal alerts suppressed | ≥ 70% noise reduction |
| Improve detection accuracy | True positive rate after learning phase | ≥ 85% |
| Enable natural interaction | Query response quality (demo judges) | Ranked, explainable, actionable |
| Demonstrate autonomy | Agents running without manual intervention | 7/7 agents autonomous |

---

## 3. Feature Requirements

### 3.1 Core Features (Must Have — MVP)

#### F1: Interactive Environmental Map
- Dark-themed map with 8 monitored zones (Indian Ocean)
- Zone polygons with severity-colored fills
- Pulsing markers at zone centers reflecting current alert status
- Heatmap overlay for SST anomaly intensity
- Click zone → detail panel; hover → tooltip
- **Data source reference:** [userflow.md §2](docs/userflow.md)

#### F2: 7-Agent Autonomous Pipeline
- **4 LLM-powered agents** (Grok 4.3): Ingestion, Detection, Triage, Brief
- **3 Rule-based agents**: Correlation, Dispatch, Learning
- LangGraph.js state machine orchestration
- Auto-triggering pipeline every 10 seconds (simulation mode)
- All agents visible with real-time status in UI
- **Architecture reference:** [implementation.md §7-Agent Architecture](implementation.md)

#### F3: Intelligent Anomaly Detection & Ranking
- Composite confidence scoring (0-100) based on magnitude, persistence, convergence, history, cross-zone
- Classification: thermal anomaly, HAB, hypoxia, bleaching, acidification, sea level, water quality, weather
- Probabilistic, horizon-bounded predictions tied to observable precursor signatures
- **Anomaly types reference:** [userflow.md §5](docs/userflow.md)

#### F4: Noise Suppression (Triage Agent)
- Suppress low-confidence and redundant alerts
- Escalate only on convergent evidence
- Display running suppression counter: "47 suppressed (71% noise reduced)"
- Structured, action-oriented outputs

#### F5: Natural Language Query Interface (Chat)
- "What needs attention right now?" → ranked, explainable response
- Zone-specific queries: "Tell me about Zone 3"
- Streaming responses with typewriter animation
- Quick-query preset buttons
- Markdown rendering for structured briefs

#### F6: Alert Feed with Explainability
- Priority-ranked glassmorphic alert cards
- Color-coded severity (Critical/Warning/Watch/Normal)
- Expandable AI-generated reasoning chain
- Feedback buttons (✅ Valid / ❌ False Positive)
- Feedback triggers Learning Agent sensitivity adjustment

#### F7: Real-Time Data Visualization (Charts)
- Multi-line time series (SST, chlorophyll, O₂ per zone)
- Alert volume stacked bar (suppressed vs. escalated)
- Confidence radial gauge (top-5 anomalies)
- Noise reduction donut chart
- Agent activity horizontal bars
- Trend sparklines in zone detail
- Prediction cone with confidence bands
- **Chart specs reference:** [ux-design.md §Charts Strip](docs/ux-design.md)

#### F8: Knowledge Graph Visualization
- Force-directed graph showing Zone → Event → Metric → Alert relationships
- Animated edge creation when Correlation Agent detects cross-zone patterns
- Node types color-coded: Zones (blue), Events (red), Metrics (green), Alerts (orange)
- Click node → highlight connected subgraph
- Neo4j backend

#### F9: Automation Timeline
- Horizontal scrolling timeline at dashboard bottom
- Shows agent activity chronologically with icons and timestamps
- Demonstrates full pipeline autonomy to judges

#### F10: Email Alert System
- Python scripts (smtplib) for email dispatch
- HTML-formatted emails with severity color coding
- In-app email preview modal before sending
- Email dispatch log

### 3.2 Enhanced Features (Should Have)

#### F11: Adaptive Learning (Learning Agent)
- Sensitivity adjustment per zone based on feedback
- Valid alert → sensitivity +5%; False positive → sensitivity -10%
- Clamped to [0.3, 2.0] range
- Visual sensitivity meter in zone detail and settings

#### F12: Simulation Mode
- Accelerated time simulation (10s intervals vs. hourly real-time)
- Start/Stop/Speed controls
- Pre-seeded demo scenario ("The Arabian Sea Crisis")
- Auto-progressing data with scripted anomaly escalation

#### F13: Agent Status Dashboard
- 7 agent cards with live status (Active/Processing/Idle/Error)
- Processing time per agent
- Messages processed counter
- Visual glow animation during processing

### 3.3 Stretch Features (Nice to Have)

#### F14: Sound Effects
- Subtle notification sound for critical alerts
- Ambient ocean background (toggleable)

#### F15: Dark/Light Theme Toggle
- Dark is default, light theme for field operations

#### F16: Export Reports
- Generate PDF situation report from current dashboard state

---

## 4. Technical Architecture

### 4.1 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Vanilla CSS |
| Charts | Recharts |
| Map | React-Leaflet + Leaflet.heat |
| Graph Viz | react-force-graph-2d |
| GenAI | Grok 4.3 (xAI API, OpenAI SDK compatible) |
| Agent Framework | LangGraph.js |
| Backend | Node.js + Express |
| Database | Neon (Serverless Postgres) |
| Knowledge Graph | Neo4j Aura |
| Email | Python scripts (smtplib) |
| Deployment | Vercel (frontend) + Render (backend) — last stage |

### 4.2 Data Sources

| Source | Provider | Data |
|---|---|---|
| GHRSST Level 4 | NASA/NOAA | Sea Surface Temperature |
| Ocean Color MODIS | NASA | Chlorophyll-a |
| ERA5 Reanalysis | ECMWF/Copernicus | Wind, waves, pressure |
| CMEMS | EU Copernicus | Ocean physics, biogeochemistry |
| Coral Reef Watch | NOAA | Bleaching alerts, DHW |
| INCOIS ERDDAP | Govt of India | Indian Ocean SST, currents |
| GOA-ON | IOC-UNESCO | pH, pCO₂ |
| Tides & Currents | NOAA | Sea level, tidal data |

**MVP approach:** Pre-downloaded historical + synthetic data for demo. Real API integration described in architecture for judges.

### 4.3 API Design
- **28 REST endpoints** across 8 route groups
- **SSE streaming** for real-time agent pipeline updates and chat responses
- **Full API reference:** [lld.md §2](docs/lld.md)

---

## 5. Monitored Zones

| Zone | Name | Region | Primary Risk |
|---|---|---|---|
| Z1 | Lakshadweep Coral Reef | Arabian Sea | Coral bleaching |
| Z2 | Gujarat Mangrove Coast | Gulf of Khambhat | HABs, water quality |
| Z3 | Kerala Upwelling Zone | Arabian Sea | Hypoxia |
| Z4 | Mumbai Offshore | Arabian Sea | Water quality, storm surge |
| Z5 | Andaman Reef System | Bay of Bengal | Bleaching, acidification |
| Z6 | Sundarbans Delta | Bay of Bengal | Sea level, erosion |
| Z7 | Goa Coastal Strip | Arabian Sea | Tourism impact, HABs |
| Z8 | Sri Lanka Southern Coast | Indian Ocean | SST anomaly, weather |

**Full zone details, coordinates, and rationale:** [userflow.md §2](docs/userflow.md)

---

## 6. Demo Scenario

### "The Arabian Sea Crisis" (Pre-seeded 30-day data)

1. **Lakshadweep** — Slow thermal buildup (+0.3°C/day × 8 days). Bleaching risk escalates.
2. **Gujarat** — Sudden chlorophyll spike (3× baseline). HAB signature.
3. **Kerala** — Dissolved O₂ declining steadily. Hypoxia developing.
4. **Mumbai** — Normal but correlated with Kerala via currents.
5. **Andaman** — Delayed SST anomaly (preceded by Lakshadweep event).
6. **Sundarbans** — pH anomaly from runoff.
7. **Goa** — Normal with noise (Triage Agent suppresses).
8. **Sri Lanka** — Normal with noise (Triage Agent suppresses).

**Demo flow:** Start monitoring → agents activate → anomalies detected → correlations found → noise suppressed → briefings generated → email dispatched → user provides feedback → system learns → "From 45 minutes to 90 seconds."

---

## 7. UX/UI Summary

- **Theme:** Dark mission control (Bloomberg Terminal × NASA)
- **Design system:** Deep navy backgrounds, teal accents, glassmorphism, Inter typography
- **Layout:** Single-page dashboard — map (60%) + sidebar (25%) + charts (15%) + timeline
- **Animations:** Pulsing markers, slide-in alerts, typewriter chat, glowing agents, animated graph edges
- **Full UX spec:** [ux-design.md](docs/ux-design.md)

---

## 8. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load time | < 3 seconds |
| Agent pipeline cycle | < 15 seconds end-to-end |
| Chat response latency | < 5 seconds first token |
| Concurrent users | 1-5 (demo scope) |
| Browser support | Chrome, Edge (latest) |
| Accessibility | Basic (color contrast, keyboard nav) |

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Grok API rate limits during demo | Pipeline stalls | Pre-cache responses for demo scenario, fallback to stored briefs |
| Neo4j Aura cold start latency | Graph panel slow to load | Pre-warm connection, cache graph data |
| Neon DB connection limits | Backend errors under load | Connection pooling, fallback to in-memory data |
| LangGraph.js complexity | Debug difficulty in 24h | Fallback to simple sequential function calls if needed |
| Email SMTP blocked (hackathon network) | Can't demo email feature | Show email preview modal as primary, actual send as bonus |

---

## 10. Reference Documents

| Document | Path | Contents |
|---|---|---|
| Problem Statement | [PS.md](PS.md) | Original hackathon challenge |
| Implementation Plan | [implementation.md](implementation.md) | Tech spec, agents, timeline |
| User Flow | [docs/userflow.md](docs/userflow.md) | Monitored phenomena, data sources, alert system |
| Low Level Design | [docs/lld.md](docs/lld.md) | API routes, page flows, DB schema, component tree |
| UX Design | [docs/ux-design.md](docs/ux-design.md) | Design system, page layouts, animations |
| PRD | [docs/prd.md](docs/prd.md) | This document |
