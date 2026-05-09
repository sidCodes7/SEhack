# AquaSentinel — AI Agent Prompts for Each Team Member


## 🎨 HET — Frontend Prompt

```
I am Het, building the frontend for "AquaSentinel" — an AI-powered environmental monitoring dashboard for a hackathon. I own EVERYTHING inside the `client/` folder. Nobody else touches my files.

## PROJECT CONTEXT
Read these files carefully before writing ANY code:
- `docs/ux-design.md` — This is your BIBLE. Follow the design system EXACTLY: colors, typography, glassmorphism, animations, layout grid. Dark theme (#050a18 base), teal accent (#00d4aa), Inter font.
- `docs/lld.md` — Section 6 has the full component tree. Section 3 has the page flow. Build components in this exact structure.
- `person/het.md` — My phase-by-phase task checklist. Follow this order strictly.
- `person/order.md` — API contracts section tells you the exact endpoints to call.
- `docs/userflow.md` — Section 5 has alert types and severity colors. Section 2 has zone coordinates for the map.
- `implementation.md` — Overall architecture context.

## WHAT TO BUILD
A single-page dark mission control dashboard (React + Vite) with:
1. Interactive map (React-Leaflet with dark Carto tiles, zone polygons, pulsing markers, heatmap layer)
2. Agent status strip (7 agent cards showing live status)
3. Alert feed sidebar (glassmorphic cards, severity-coded, expandable reasoning, feedback buttons)
4. AI chat panel (streaming typewriter effect, quick query buttons)
5. Charts strip (Recharts: time-series, bar charts, radial gauge, donut, sparklines)
6. Knowledge graph panel (react-force-graph-2d overlay)
7. Zone detail panel (slide-in overlay when clicking a zone)
8. Automation timeline (horizontal scrolling event log)
9. Email preview modal
10. Settings slide-out panel

## TECH STACK
- React 18 + Vite (already scaffolded or scaffold with `npm create vite@latest . -- --template react`)
- Vanilla CSS (NO Tailwind) — use CSS custom properties from the design system
- Recharts for all charts
- react-leaflet + leaflet + leaflet.heat for map
- react-force-graph-2d for knowledge graph
- Google Fonts: Inter (body) + JetBrains Mono (data/mono)

## CRITICAL RULES
1. Follow the color palette from `docs/ux-design.md` EXACTLY — no generic blues or whites
2. Every card/panel uses the `.glass-card` class (backdrop-filter blur, semi-transparent bg)
3. ALL animations from the UX spec must be implemented (pulse-critical, slide-in-right, typewriter, agent-processing)
4. The map MUST use dark Carto tiles: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
5. Center map on Indian Ocean: lat 12, lng 78, zoom 5
6. SSE (EventSource) for real-time updates from backend — the hook `useAgentStatus.js` listens to `/api/agents/run-pipeline`
7. API base URL: `http://localhost:3001` — all calls go through `services/api.js`
8. DO NOT touch anything outside `client/` folder
9. Data density matters — this should look like Bloomberg Terminal, NOT a consumer app
10. Make it look PREMIUM. Judges will evaluate visual quality. Glassmorphism, gradients, micro-animations everywhere.

## API CONTRACTS (Backend runs on port 3001)
For Phase 1-3, use hardcoded mock data. In Phase 4, wire to these real endpoints:
- GET /api/zones → Zone[] 
- GET /api/readings/latest → Reading[]
- GET /api/readings/timeseries?zone_id=Z1&metric=sst&days=30 → {timestamps[], values[]}
- GET /api/agents/status → AgentStatus[]
- GET /api/alerts → Alert[] (ranked by score)
- POST /api/alerts/:id/feedback → {was_valid, notes}
- POST /api/chat/query → SSE stream (event: token, event: done)
- POST /api/simulation/start → {session_id}
- SSE /api/agents/run-pipeline → event stream (agent_status, anomaly_detected, alert_escalated, etc.)
- GET /api/graph/nodes → GraphNode[]
- GET /api/graph/edges → GraphEdge[]
- POST /api/email/send → {sent, preview}
- GET /api/alerts/stats → {total, suppressed, escalated, noise_pct}

## PHASE ORDER
Start with Phase 1 (scaffold + design system CSS), then Phase 2 (layout + map), then Phase 3 (alerts + chat + charts), then Phase 4 (interactive panels + SSE wiring), then Phase 5 (polish). Check off tasks in person/het.md as you complete them.

## ZONE DATA (for map — hardcode initially)
8 zones along Indian Ocean coast:
Z1: Lakshadweep (10.57°N, 72.63°E) — coral bleaching
Z2: Gujarat (21.63°N, 72.18°E) — HABs
Z3: Kerala (9.93°N, 76.26°E) — hypoxia
Z4: Mumbai (19.07°N, 72.87°E) — water quality
Z5: Andaman (11.74°N, 92.66°E) — bleaching
Z6: Sundarbans (21.94°N, 89.18°E) — sea level
Z7: Goa (15.49°N, 73.82°E) — tourism impact
Z8: Sri Lanka (6.03°N, 80.22°E) — SST anomaly

Begin with Phase 1 now. Create the Vite project, install deps, set up the full CSS design system, then move to layout.
```

---

## ⚙️ SIDDH — Backend Prompt

```
I am Siddh, building the backend API server for "AquaSentinel" — an AI-powered environmental monitoring platform for a hackathon. I own `server/src/routes/`, `server/src/middleware/`, `server/src/index.js`, and `server/package.json`.

## PROJECT CONTEXT
Read these files carefully before writing ANY code:
- `docs/lld.md` — Section 2 has ALL 28 API routes I must implement. Section 3.3 has the SSE event format. This is my primary reference.
- `person/siddh.md` — My phase-by-phase task checklist. Follow this order.
- `person/order.md` — API contracts and interface agreements with other team members.
- `implementation.md` — Overall architecture.
- `docs/userflow.md` — Section 4 has user interaction flows showing how the API is consumed.

## WHAT TO BUILD
An Express.js REST API server on port 3001 with:
1. 28 REST endpoints across 8 route groups (zones, readings, agents, alerts, chat, graph, simulation, email)
2. SSE (Server-Sent Events) streaming for real-time pipeline updates and chat responses
3. Simulation engine (setInterval-based loop that triggers the agent pipeline)
4. CORS for frontend on localhost:5173
5. Centralized error handling middleware

## TECH STACK
- Node.js + Express
- ESM modules (`"type": "module"` in package.json)
- dotenv for environment variables
- nodemon for dev
- NO database drivers — Dev installs those. I just import from `../services/`
- NO AI/agent code — Avani owns that. I just import from `../agents/`

## CRITICAL RULES
1. DO NOT create files in `server/src/services/` — Dev owns that
2. DO NOT create files in `server/src/agents/` — Avani owns that
3. DO NOT touch anything in `client/` — Het owns that
4. All routes go in `server/src/routes/` as separate files per resource
5. Phase 2: Build ALL routes with MOCK/HARDCODED responses first. This lets Het test the frontend immediately without waiting for DB or agents.
6. Phase 4: Replace mocks with real imports from Dev's services and Avani's agents
7. SSE format must match what Het expects (see contracts in order.md):
   - Set headers: Content-Type text/event-stream, Cache-Control no-cache, Connection keep-alive
   - Send: `event: {type}\ndata: {json}\n\n`
   - Event types: agent_status, reading_ingested, anomaly_detected, correlation_found, alert_suppressed, alert_escalated, brief_generated, email_dispatched, sensitivity_updated, cycle_complete
8. Simulation endpoint manages a setInterval. POST /start creates it, POST /stop clears it.
9. For chat SSE: stream token-by-token from Brief Agent, send `event: token` per chunk, `event: done` at end

## MOCK DATA EXAMPLES (for Phase 2)
Mock zone: { id: 1, name: "Lakshadweep Coral Reef", region: "Arabian Sea", lat: 10.57, lng: 72.63, sensitivity: 1.0 }
Mock alert: { id: 1, zone_id: 1, zone_name: "Lakshadweep", anomaly_type: "thermal_spike", severity: "critical", confidence: 87, score: 91, reasoning: "SST +1.8°C above baseline for 8 days", status: "active" }
Mock agent status: { name: "ingestion", icon: "📡", status: "idle", lastRun: "2026-05-08T14:00:00Z", processed: 42 }

## IMPORT CONTRACTS (Phase 4 — when wiring real services)
From Dev (server/src/services/):
  import { db } from '../services/neonDb.js';       // db.query(), db.getZones(), db.getReadings(), etc.
  import { graph } from '../services/neo4jClient.js'; // graph.getNodes(), graph.getEdges(), etc.
  import { runEmailScript } from '../services/emailRunner.js';

From Avani (server/src/agents/):
  import { runPipeline } from '../agents/orchestrator.js';    // runPipeline(readings, onEvent)
  import { queryBriefAgent } from '../agents/briefAgent.js';  // queryBriefAgent(message, context) → async generator
  import { getAgentStatuses } from '../agents/agentState.js'; // getAgentStatuses() → object

## PHASE ORDER
Phase 1: Express scaffold + index.js + folder structure → push to main
Phase 2: ALL 28 routes with mock responses → feat/api-routes
Phase 3: SSE infrastructure + simulation engine → feat/sse-simulation
Phase 4: Wire real services (replace mocks with imports) → feat/integration
Phase 5: Validation, error handling, logging → feat/hardening

Begin with Phase 1 now. Set up Express, CORS, dotenv, mount route files.
```

---

## 🤖 AVANI — AI/Agent Prompt

```
I am Avani, building the AI agent system for "AquaSentinel" — a 7-agent environmental monitoring pipeline for a hackathon. I own EVERYTHING inside `server/src/agents/`. Nobody else touches my files.

## PROJECT CONTEXT
Read these files carefully before writing ANY code:
- `implementation.md` — Section "7-Agent Architecture" has the full agent specs, flow diagram, and input/output contracts for all 7 agents.
- `person/avani.md` — My phase-by-phase task checklist. Follow this order strictly.
- `person/order.md` — Interface contracts showing how Siddh's routes call my agents.
- `docs/userflow.md` — Section 4.2 has the alert lifecycle (how agents process data). Section 5 has alert types and confidence scoring weights.
- `docs/lld.md` — Section 5 has the LangGraph state machine design and agent I/O contracts.
- `PS.md` — The original problem statement. My agents must address ALL 5 requirements.

## WHAT TO BUILD
A 7-agent agentic pipeline using LangGraph.js:
1. 📡 Ingestion Agent (LLM) — Normalizes raw sensor data, flags quality issues
2. 🔍 Detection Agent (LLM) — Scores anomalies 0-100 with reasoning, classifies type
3. 🔗 Correlation Agent (RULE-BASED) — Cross-zone pattern matching via adjacency matrix
4. ⚖️ Triage Agent (LLM) — Suppresses 70% noise, ranks by convergent evidence
5. 📋 Brief Agent (LLM) — Generates NL briefings + answers chat queries
6. 🚨 Dispatch Agent (RULE-BASED) — Routes alerts to email/dashboard by severity
7. 🧠 Learning Agent (RULE-BASED) — Adjusts zone sensitivity from feedback

Plus: LangGraph StateGraph orchestrator that chains all 7 agents.

## TECH STACK
- openai npm package (Grok API is OpenAI-compatible)
- @langchain/langgraph for state machine
- @langchain/core, @langchain/openai for LLM integration
- Grok 4.3 model, base URL: https://api.x.ai/v1
- API key from env: process.env.XAI_API_KEY

## CRITICAL RULES
1. DO NOT create files outside `server/src/agents/` — I only own this folder
2. 4 agents use Grok LLM (Ingestion, Detection, Triage, Brief). 3 are pure JavaScript rules (Correlation, Dispatch, Learning). This is intentional — rule-based agents are faster and more reliable.
3. ALL Grok calls go through my `grokClient.js` wrapper — never import openai directly in agent files
4. Every LLM agent prompt must request JSON output with `response_format: { type: 'json_object' }`
5. Every agent must: (a) update status via agentState.js, (b) log activity, (c) emit events via the onEvent callback
6. The orchestrator exports `runPipeline(readings, onEvent)` — Siddh's routes call this
7. Brief Agent also exports `queryBriefAgent(message, context)` — for chat endpoint
8. Detection Agent scoring weights: magnitude 30%, temporal persistence 25%, multi-metric convergence 20%, historical pattern 15%, cross-zone correlation 10%
9. Triage Agent target: suppress 60-70% of anomalies
10. Learning Agent math: valid feedback → sensitivity × 1.05, false positive → sensitivity × 0.90, clamp [0.3, 2.0]
11. Correlation Agent adjacency (hardcoded):
    Z1↔Z5,Z7 | Z2↔Z4,Z7 | Z3↔Z4,Z7 | Z4↔Z2,Z3,Z7 | Z5↔Z1,Z8 | Z6↔Z5 | Z7↔Z1,Z2,Z3 | Z8↔Z5,Z1

## IMPORT CONTRACTS (from Dev's services — I import these)
  import { db } from '../services/neonDb.js';        // db.getReadings(), db.insertAnomaly(), db.updateZoneSensitivity(), db.insertAgentLog()
  import { graph } from '../services/neo4jClient.js'; // graph.addEvent(), graph.addCorrelation()
  import { runEmailScript } from '../services/emailRunner.js'; // For dispatch agent

## EXPORT CONTRACTS (Siddh imports from me)
  // From orchestrator.js:
  export async function runPipeline(readings, onEvent) → finalState
  // onEvent is a callback: (eventType: string, data: object) => void
  
  // From briefAgent.js:
  export async function queryBriefAgent(message, context) → string (streamed)
  
  // From agentState.js:
  export function getAgentStatuses() → { ingestion: {status, lastRun, processed}, ... }

## LLM PROMPTS — KEY PRINCIPLES
- Detection: Be specific about what constitutes an anomaly for EACH metric (SST > 2σ above seasonal baseline = thermal spike, chlorophyll > 3× baseline = potential bloom, DO < 4.0 mg/L = hypoxia risk, etc.)
- Triage: Emphasize SUPPRESSION. The whole point is reducing alert fatigue. Show judges that 70% of noise is eliminated.
- Brief: Responses must be structured: SITUATION → EVIDENCE → ACTIONS → IMPACT. For chat queries, synthesize all active alerts into a ranked response.
- All prompts: Include the context "You are part of AquaSentinel, an AI-powered marine environmental monitoring system analyzing Indian Ocean zones."

## PHASE ORDER
Phase 1: Scaffold + grokClient.js + agentState.js → verify Grok API works
Phase 2: Ingestion Agent + Detection Agent (the two hardest LLM agents)
Phase 3: Triage + Brief + Correlation + Dispatch + Learning (remaining 5 agents)
Phase 4: LangGraph orchestrator wiring all 7 agents into state machine
Phase 5: Prompt tuning with demo data + caching responses for reliable demo

Begin with Phase 1 now. Create grokClient.js, test Grok connectivity, create agentState.js.
```

---

## 📊 DEV — Data & Integration Prompt

```
I am Dev, building the data layer and integration services for "AquaSentinel" — an AI-powered environmental monitoring platform for a hackathon. I own `server/src/services/`, `server/src/data/`, `scripts/`, `db/`, and `.env.example`.

## PROJECT CONTEXT
Read these files carefully before writing ANY code:
- `implementation.md` — Has the full Postgres schema (Section "Data Model") and Neo4j graph model.
- `person/dev.md` — My phase-by-phase task checklist. Follow this order strictly.
- `person/order.md` — Environment variables and interface contracts.
- `docs/lld.md` — Section 4 has the full ERD and database design.
- `docs/userflow.md` — Section 2 has zone coordinates and details. Section 3.3 has the data schema per reading.

## WHAT TO BUILD
1. Neon Postgres setup: schema, connection pool, query helper methods
2. Neo4j Aura setup: graph schema, driver, Cypher query helpers
3. Synthetic data generator: 30 days × 8 zones of realistic environmental data with seeded anomalies
4. Python email scripts: smtplib-based alert emailer with HTML templates
5. Email runner service: Node.js wrapper that spawns Python script via child_process
6. Seed scripts: populate both databases with demo data

## TECH STACK
- pg (node-postgres) for Neon — tell Siddh to install
- neo4j-driver for Neo4j Aura — tell Siddh to install  
- Python 3 + smtplib (stdlib) for email scripts
- dotenv for env vars (Siddh installs this)

## CRITICAL RULES
1. DO NOT create files in `server/src/routes/` — Siddh owns that
2. DO NOT create files in `server/src/agents/` — Avani owns that
3. DO NOT touch anything in `client/` — Het owns that
4. All DB service files go in `server/src/services/`
5. All data generation files go in `server/src/data/`
6. All Python scripts go in `scripts/`
7. All SQL/Cypher schema files go in `db/`
8. neonDb.js must export a `db` object with convenience methods (getZones, getReadings, insertAnomaly, etc.) — Siddh and Avani both import this
9. neo4jClient.js must export a `graph` object with convenience methods — same consumers
10. emailRunner.js must export `runEmailScript(alertData)` that spawns Python
11. Synthetic data MUST tell the demo story (see Demo Scenario below)
12. Use connection pooling for Postgres. Handle Neo4j session lifecycle properly (open/close per query).

## EXPORT CONTRACTS (Siddh and Avani import from me)
  // From server/src/services/neonDb.js:
  export const db = {
    query(text, params),           // raw SQL
    getZones(),                    // SELECT * FROM zones
    getZone(id),                   // single zone
    getReadings(zoneId, limit),    // zone readings
    getLatestReadings(),           // latest per zone
    getTimeSeries(zoneId, metric, days), // for charts
    insertReading(reading),        // new reading
    insertAnomaly(anomaly),        // detected anomaly
    updateZoneSensitivity(id, val),// learning agent
    insertAgentLog(log),           // agent activity
    insertEmailLog(log),           // email record
    getActiveAnomalies(),          // for alert feed
    submitFeedback(id, valid, notes), // user feedback
    getAlertStats(),               // suppressed/escalated counts
    getAgentLogs(limit),           // timeline data
    getEmailLogs(),                // email history
  };

  // From server/src/services/neo4jClient.js:
  export const graph = {
    run(cypher, params),           // raw cypher
    getNodes(type),                // all nodes of type
    getEdges(),                    // all relationships
    getZoneSubgraph(zoneId),       // zone + connected nodes
    addEvent(event),               // create event node + relationships
    addCorrelation(from, to, type, confidence), // create edge
    getCorrelations(hours),        // recent correlations
  };

  // From server/src/services/emailRunner.js:
  export function runEmailScript(alertData) → Promise<{sent, to, subject}>

## DEMO SCENARIO — "The Arabian Sea Crisis"
Generate 30 days of hourly readings (720 data points per zone, 5760 total) with:
- Z1 Lakshadweep: SST baseline 28.5°C ±0.8. Starting day 22, ramp +0.3°C/day for 8 days. By day 30: SST=30.9°C (critical thermal stress, DHW exceeding 4)
- Z2 Gujarat: Chlorophyll baseline 0.9 mg/m³. Day 27: spike to 2.7 (3×). Day 29: reaches 4.5 (5×). Pattern: Noctiluca bloom signature.
- Z3 Kerala: DO baseline 6.5 mg/L. Starting day 20, decline -0.15/day. By day 30: DO=5.0 (approaching hypoxia threshold of 4.0).
- Z4 Mumbai: Normal readings. Slight turbidity increase days 25-30 (correlated with Z3 via currents).
- Z5 Andaman: SST baseline 28.0°C. Starting day 25 (3 days AFTER Z1), ramp +0.2°C/day. Shows preceded_by correlation with Z1.
- Z6 Sundarbans: pH baseline 8.1. Starting day 28, drop -0.03/day. Indicates acidification onset.
- Z7 Goa: Normal. Add chlorophyll fluctuations (0.5-1.2 range) that LOOK like they could be a bloom but aren't. This is noise the Triage Agent should suppress.
- Z8 Sri Lanka: Normal. Minor SST and wind variations. Noise.

All readings include: sst, chlorophyll, dissolved_o2, turbidity, ph, salinity, wind_speed, wave_height. Add Gaussian noise to all metrics (±1σ).

## ZONE COORDINATES (for Postgres + Neo4j seeding)
Z1: Lakshadweep (10.57, 72.63) — Arabian Sea
Z2: Gujarat (21.63, 72.18) — Gulf of Khambhat  
Z3: Kerala (9.93, 76.26) — Arabian Sea
Z4: Mumbai (19.07, 72.87) — Arabian Sea
Z5: Andaman (11.74, 92.66) — Bay of Bengal
Z6: Sundarbans (21.94, 89.18) — Bay of Bengal
Z7: Goa (15.49, 73.82) — Arabian Sea
Z8: Sri Lanka (6.03, 80.22) — Indian Ocean

## NEO4J ADJACENCY GRAPH
Z1↔Z5, Z1↔Z7 | Z2↔Z4, Z2↔Z7 | Z3↔Z4, Z3↔Z7 | Z4↔Z2, Z4↔Z3, Z4↔Z7 | Z5↔Z1, Z5↔Z8 | Z6↔Z5 | Z7↔Z1, Z7↔Z2, Z7↔Z3 | Z8↔Z5, Z8↔Z1

## ACCOUNTS TO SET UP
1. Neon: neon.tech → create project "aquasentinel" → get connection string
2. Neo4j Aura: neo4j.io → create free AuraDB → get URI + credentials
3. Gmail App Password: Google Account → Security → 2FA → App Passwords

## PHASE ORDER
Phase 1: Create .env.example, db/schema.sql, db/neo4j-schema.cypher, neonDb.js, neo4jClient.js, emailRunner.js → provision databases → verify connections
Phase 2: Synthetic data generator + seed scripts → populate both databases
Phase 3: Python email scripts with HTML templates → test sending
Phase 4: Add all convenience query methods to services → verify exports work
Phase 5: Polish demo data, add reset script, edge case handling

Begin with Phase 1 now. Create the env file, schema files, and service clients.
