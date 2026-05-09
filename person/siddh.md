# ⚙️ Siddh — Backend Lead

> **Ownership:** `server/src/routes/`, `server/src/middleware/`, `server/src/index.js`, `server/package.json`
> **Tech:** Node.js, Express, SSE, CORS
> **Zero conflict zone:** Siddh never touches `client/`, `server/src/agents/`, `server/src/services/`, `scripts/`, or `db/`

---

## Phase 1: Server Scaffold (Hour 0–1)

- [ ] Initialize Node.js project in `server/`
  ```bash
  cd server && npm init -y
  ```
- [ ] Install dependencies:
  ```bash
  npm install express cors dotenv
  npm install -D nodemon
  ```
- [ ] Add to `package.json` scripts:
  ```json
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
  ```
- [ ] Set `"type": "module"` in `package.json` for ESM imports
- [ ] Create `server/src/index.js`:
  - Express app setup
  - CORS configured for `http://localhost:5173`
  - JSON body parser
  - Route mounting (import all route files)
  - Port 3001
  - Error handling middleware
- [ ] Create `server/src/middleware/errorHandler.js` — centralized error handler
- [ ] Create folder structure:
  ```
  server/src/
  ├── routes/
  ├── middleware/
  └── index.js
  ```
- [ ] Verify server starts: `npm run dev` → "AquaSentinel API running on port 3001"
- [ ] **GIT PUSH:** `main` (first push — establishes server base)

---

## Phase 2: All API Routes with Mock Responses (Hour 1–4)

> Strategy: Build ALL routes with hardcoded mock responses first. Wire to real services later.

- [ ] Create `server/src/routes/zones.js`
  ```
  GET  /api/zones              → Return mock Zone[] (8 zones)
  GET  /api/zones/:id          → Return single mock zone
  GET  /api/zones/:id/readings → Return mock readings array
  GET  /api/zones/:id/anomalies → Return mock anomalies
  PATCH /api/zones/:id/sensitivity → Accept { sensitivity }, return updated
  ```
- [ ] Create `server/src/routes/readings.js`
  ```
  GET  /api/readings/latest    → Mock latest reading per zone (8 items)
  GET  /api/readings/timeseries → Mock time-series { timestamps[], values[] }
  POST /api/readings/ingest    → Accept zone data, return { processed: true }
  ```
- [ ] Create `server/src/routes/agents.js`
  ```
  GET  /api/agents/status      → Mock 7 agent statuses
  GET  /api/agents/logs        → Mock agent activity log
  POST /api/agents/run-pipeline → SSE stream (mock events for now)
  GET  /api/agents/metrics     → { processed, suppressed, escalated }
  ```
- [ ] Create `server/src/routes/alerts.js`
  ```
  GET  /api/alerts             → Mock ranked alerts
  GET  /api/alerts/:id         → Mock alert detail with reasoning
  POST /api/alerts/:id/feedback → Accept { was_valid, notes }
  GET  /api/alerts/suppressed  → { count, alerts[] }
  GET  /api/alerts/stats       → { total, suppressed, escalated, noise_pct }
  ```
- [ ] Create `server/src/routes/chat.js`
  ```
  POST /api/chat/query         → SSE stream (mock AI response for now)
  GET  /api/chat/suggestions   → ["What needs attention?", "Zone status", ...]
  ```
- [ ] Create `server/src/routes/graph.js`
  ```
  GET  /api/graph/nodes        → Mock graph nodes
  GET  /api/graph/edges        → Mock graph edges
  GET  /api/graph/zone/:id/subgraph → Mock subgraph
  GET  /api/graph/correlations → Mock correlations
  ```
- [ ] Create `server/src/routes/simulation.js`
  ```
  POST /api/simulation/start   → Start interval timer, return { session_id }
  POST /api/simulation/stop    → Clear interval, return { stopped: true }
  GET  /api/simulation/status  → { running, cycle, elapsed }
  ```
- [ ] Create `server/src/routes/email.js`
  ```
  POST /api/email/send         → Accept { anomaly_id, recipient }
  GET  /api/email/preview/:anomaly_id → Return { subject, html_body }
  GET  /api/email/logs         → Mock email log
  ```
- [ ] Mount all routes in `index.js`
- [ ] Test all endpoints with curl/Postman
- [ ] **GIT PUSH:** `feat/api-routes`

---

## Phase 3: SSE Infrastructure & Simulation Engine (Hour 4–7)

- [ ] Create SSE helper in `server/src/middleware/sse.js`:
  ```js
  // Sets proper headers for SSE
  export function initSSE(res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
  }
  
  export function sendSSE(res, event, data) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }
  ```
- [ ] Implement `POST /api/agents/run-pipeline` with real SSE:
  - Accept connection, send keepalive
  - When pipeline runs (via Avani's orchestrator), emit events:
    - `agent_status` — agent processing state changes
    - `reading_ingested` — new data processed
    - `anomaly_detected` — anomaly found
    - `correlation_found` — cross-zone link
    - `alert_suppressed` — noise filtered
    - `alert_escalated` — alert promoted
    - `brief_generated` — briefing created
    - `email_dispatched` — email sent
    - `sensitivity_updated` — learning applied
    - `cycle_complete` — pipeline done
- [ ] Implement `POST /api/chat/query` with real SSE:
  - Stream Brief Agent response token by token
  - Send `event: token` with each chunk
  - Send `event: done` when complete
- [ ] Implement simulation loop in `simulation.js`:
  - `POST /start`: Create `setInterval` at configured speed (default 10s)
  - Each tick: call Avani's `runPipeline()` → emit SSE events
  - `POST /stop`: `clearInterval`
  - `GET /status`: Return running state, cycle count, start time
  - Store simulation state in module-level variable (no DB needed)
- [ ] **GIT PUSH:** `feat/sse-simulation`

---

## Phase 4: Wire Real Services (Hour 7–10)

> Replace mock data with real calls to Dev's services and Avani's agents

- [ ] Update `routes/zones.js`:
  - Import `{ db }` from Dev's `../services/neonDb.js`
  - Replace mock responses with `db.query('SELECT * FROM zones')`
  - Wire PATCH sensitivity to update zone record
- [ ] Update `routes/readings.js`:
  - Import `{ db }` from Dev's service
  - Query readings table for time-series data
  - Wire `/ingest` to trigger Avani's `runPipeline()`
- [ ] Update `routes/agents.js`:
  - Import `{ runPipeline }` from Avani's `../agents/orchestrator.js`
  - Wire run-pipeline route to real agent execution
  - Agent status from in-memory state (Avani exposes `getAgentStatuses()`)
  - Agent logs from `db.query('SELECT * FROM agent_logs')`
- [ ] Update `routes/alerts.js`:
  - Query anomalies table, join with zones for display
  - Wire feedback POST to Dev's DB + Avani's learning agent
  - Stats from aggregation query on anomalies table
- [ ] Update `routes/chat.js`:
  - Import `{ queryBriefAgent }` from Avani's `../agents/briefAgent.js`
  - Stream Grok response via SSE
- [ ] Update `routes/graph.js`:
  - Import `{ neo4j }` from Dev's `../services/neo4jClient.js`
  - Run Cypher queries for nodes, edges, subgraphs
- [ ] Update `routes/email.js`:
  - Import `{ runEmailScript }` from Dev's `../services/emailRunner.js`
  - Wire send to Python script execution
  - Wire preview to template rendering
  - Wire logs to email_logs table query
- [ ] **GIT PUSH:** `feat/integration`

---

## Phase 5: Hardening & Demo (Hour 10–12)

- [ ] Add request validation (check required params, valid zone IDs)
- [ ] Add proper error responses (400, 404, 500 with messages)
- [ ] Add request logging middleware (timestamp, method, path, status)
- [ ] Test full flow: simulation start → SSE events → frontend updates
- [ ] Test chat: query → streaming response → done event
- [ ] Test email: preview → send → log entry
- [ ] Ensure graceful shutdown (close DB connections, clear intervals)
- [ ] **GIT PUSH:** `feat/hardening`

---

## Dependencies on Other Team Members

| I need from | What | When |
|---|---|---|
| **Dev** | `neonDb.js`, `neo4jClient.js`, `emailRunner.js` exports | Phase 4 |
| **Avani** | `orchestrator.js` `runPipeline()` export, `briefAgent.js` `queryBriefAgent()` | Phase 4 |
| **Het** | Nothing (Het calls my API, I don't call Het's code) | — |

## Packages Siddh Adds to server/package.json
```
express, cors, dotenv, nodemon (dev)
```
> Dev will add: pg, neo4j-driver
> Avani will add: openai, @langchain/core, @langchain/langgraph (tell Siddh to install)
