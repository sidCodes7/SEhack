# AquaSentinel — Git Push Order & Coordination Guide

## Team Ownership Map (Zero-Conflict Zones)

```
aquasentinel/
├── client/                  ← 🎨 HET (100% ownership)
│   ├── public/
│   ├── src/
│   │   ├── components/      ← Het only
│   │   ├── hooks/           ← Het only
│   │   ├── services/api.js  ← Het only
│   │   ├── data/            ← Het only (frontend mock data)
│   │   ├── styles/          ← Het only
│   │   ├── App.jsx          ← Het only
│   │   └── main.jsx         ← Het only
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── routes/          ← ⚙️ SIDDH (100% ownership)
│   │   ├── middleware/      ← Siddh only
│   │   ├── index.js         ← Siddh only
│   │   ├── agents/          ← 🤖 AVANI (100% ownership)
│   │   └── services/        ← 📊 DEV (100% ownership)
│   └── package.json         ← Siddh creates, Dev adds db deps
│
├── scripts/                 ← 📊 DEV (100% ownership)
│   ├── email_alert.py
│   ├── email_templates.py
│   ├── seed_neon.js
│   ├── seed_neo4j.js
│   └── requirements.txt
│
├── db/                      ← 📊 DEV (100% ownership)
│   ├── schema.sql
│   └── neo4j-schema.cypher
│
└── docs/                    ← SHARED (read-only reference)
```

## Git Push Order

### Round 1: Scaffolding (Everyone pushes to their own folders — PARALLEL, no conflicts)

| Order | Who | Branch | What | Time |
|---|---|---|---|---|
| 1a | **Siddh** | `main` | `server/package.json`, `server/src/index.js` (Express skeleton) | 30 min |
| 1b | **Het** | `feat/frontend-scaffold` | `client/` scaffold (Vite + React + CSS design system) | 30 min |
| 1c | **Dev** | `feat/data-layer` | `db/`, `scripts/`, `server/src/services/` (DB clients) | 30 min |
| 1d | **Avani** | `feat/agents` | `server/src/agents/` (orchestrator skeleton + Grok client) | 30 min |

**Merge order:** Siddh first (main) → Dev → Avani → Het (all touch different folders = no conflicts)

### Round 2: Core Implementation (PARALLEL — still no conflicts)

| Order | Who | Branch | What | Time |
|---|---|---|---|---|
| 2a | **Siddh** | `feat/api-routes` | All route files in `server/src/routes/` | 2h |
| 2b | **Het** | `feat/dashboard-ui` | Map, charts, agent strip, alert feed components | 3h |
| 2c | **Dev** | `feat/seed-data` | Synthetic data generator, seed scripts, DB population | 2h |
| 2d | **Avani** | `feat/agent-pipeline` | 7 agents implemented, LangGraph state machine | 3h |

**Merge order:** Dev first (data needed by routes) → Siddh → Avani → Het

### Round 3: Integration (Sequential — routes call agents which call DB)

| Order | Who | Branch | What | Time |
|---|---|---|---|---|
| 3a | **Siddh** | `feat/integration` | Wire routes → agents → services (import wiring) | 1h |
| 3b | **Het** | `feat/interactive` | Chat UI, zone detail, knowledge graph, SSE listeners | 2h |
| 3c | **Avani** | `feat/agent-sse` | SSE event emitters in agent pipeline | 1h |
| 3d | **Dev** | `feat/email-scripts` | Python email scripts, email runner service | 1h |

**Merge order:** Avani → Siddh (needs agent exports) → Dev → Het

### Round 4: Polish (PARALLEL)

| Order | Who | Branch | What | Time |
|---|---|---|---|---|
| 4a | **Het** | `feat/polish` | Animations, transitions, responsive, final UI touches | 2h |
| 4b | **Siddh** | `feat/simulation` | Simulation loop endpoint, auto-cycle timer | 1h |
| 4c | **Avani** | `feat/agent-prompts` | Prompt tuning, demo scenario testing | 1h |
| 4d | **Dev** | `feat/demo-data` | Final demo scenario data, edge case seeding | 1h |

**Merge order:** Any order (no conflicts)

---

## Interface Contracts (AGREE BEFORE CODING)

### Contract 1: Het ↔ Siddh (Frontend calls Backend)

Het's `api.js` calls Siddh's routes. Agree on:
```
GET  /api/zones              → Zone[]
GET  /api/readings/latest    → Reading[]
GET  /api/agents/status      → AgentStatus[]
GET  /api/alerts             → Alert[]
POST /api/chat/query         → SSE stream
POST /api/simulation/start   → { session_id }
SSE  /api/agents/run-pipeline → event stream
```

### Contract 2: Siddh ↔ Avani (Routes call Agents)

Siddh's route handlers import Avani's agent functions:
```js
// Siddh imports from Avani's code:
import { runPipeline } from '../agents/orchestrator.js';
import { queryBriefAgent } from '../agents/briefAgent.js';
```

### Contract 3: Siddh ↔ Dev & Avani ↔ Dev (Everyone uses Dev's services)

Everyone imports Dev's service clients:
```js
// Dev exports:
import { db } from '../services/neonDb.js';
import { neo4j } from '../services/neo4jClient.js';
import { runEmailScript } from '../services/emailRunner.js';
```

---

## Communication Rules

1. **Before coding:** All 4 agree on API contracts above
2. **During coding:** Each person ONLY touches their folders
3. **Before merging:** Pull latest main, resolve any package.json conflicts
4. **Package.json:** Siddh owns `server/package.json`. Others tell Siddh what deps to add
5. **Het owns `client/package.json`** entirely — no conflicts
6. **Environment variables:** Dev creates `.env.example`, everyone copies to `.env`

## Env Variables (Dev creates `.env.example`)
```
XAI_API_KEY=
NEON_DATABASE_URL=
NEO4J_URI=
NEO4J_USER=
NEO4J_PASSWORD=
SMTP_HOST=smtp.gmail.com
SMTP_USER=
SMTP_PASS=
ALERT_EMAIL_TO=
```
