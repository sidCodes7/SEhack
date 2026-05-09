# 🤖 Avani — AI/Agent Lead

> **Ownership:** `server/src/agents/` (100% — all 7 agents + orchestrator + Grok client)
> **Tech:** LangGraph.js, OpenAI SDK (Grok), prompt engineering
> **Zero conflict zone:** Avani never touches `client/`, `server/src/routes/`, `scripts/`, or `db/`

---

## Phase 1: Agent Scaffold & Grok Client (Hour 0–1.5)

- [ ] Tell Siddh to install these in `server/package.json`:
  ```bash
  npm install openai @langchain/core @langchain/langgraph @langchain/openai
  ```
- [ ] Create folder structure:
  ```
  server/src/agents/
  ├── grokClient.js        ← Grok API via OpenAI SDK
  ├── orchestrator.js      ← LangGraph state machine
  ├── ingestionAgent.js    ← LLM agent
  ├── detectionAgent.js    ← LLM agent
  ├── correlationAgent.js  ← Rule-based agent
  ├── triageAgent.js       ← LLM agent
  ├── briefAgent.js        ← LLM agent
  ├── dispatchAgent.js     ← Rule-based agent
  ├── learningAgent.js     ← Rule-based agent
  └── agentState.js        ← Shared state types + in-memory status
  ```
- [ ] Create `grokClient.js`:
  ```js
  import OpenAI from 'openai';
  
  const grok = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: 'https://api.x.ai/v1',
  });
  
  export async function callGrok(systemPrompt, userMessage, options = {}) {
    const response = await grok.chat.completions.create({
      model: 'grok-4.3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: options.temperature || 0.3,
      max_tokens: options.maxTokens || 2000,
      response_format: options.json ? { type: 'json_object' } : undefined,
    });
    return response.choices[0].message.content;
  }
  
  export async function streamGrok(systemPrompt, userMessage) {
    return grok.chat.completions.create({
      model: 'grok-4.3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: true,
      temperature: 0.4,
    });
  }
  
  export default grok;
  ```
- [ ] Create `agentState.js`:
  ```js
  // In-memory agent status tracking
  const agentStatuses = {
    ingestion:   { status: 'idle', lastRun: null, processed: 0 },
    detection:   { status: 'idle', lastRun: null, processed: 0 },
    correlation: { status: 'idle', lastRun: null, processed: 0 },
    triage:      { status: 'idle', lastRun: null, processed: 0 },
    brief:       { status: 'idle', lastRun: null, processed: 0 },
    dispatch:    { status: 'idle', lastRun: null, processed: 0 },
    learning:    { status: 'idle', lastRun: null, processed: 0 },
  };
  
  export function getAgentStatuses() { return agentStatuses; }
  export function updateAgentStatus(name, status) { ... }
  
  // Pipeline state (LangGraph state shape)
  export const INITIAL_STATE = {
    readings: [],
    normalized: [],
    anomalies: [],
    correlations: [],
    triaged: { escalated: [], suppressed: [], watch: [] },
    briefs: [],
    dispatches: [],
    agentLogs: [],
  };
  ```
- [ ] Test Grok connectivity: simple prompt → response
- [ ] **GIT PUSH:** `feat/agents`

---

## Phase 2: LLM Agents — Ingestion & Detection (Hour 1.5–5)

### Ingestion Agent
- [ ] Create `ingestionAgent.js`:
  - System prompt: "You are a marine data scientist. You receive raw sensor readings and normalize them..."
  - Input: raw readings from DB (Dev's `neonDb.js`)
  - Processing:
    1. Validate readings (check for nulls, out-of-range values)
    2. Flag quality issues (sensor error, missing data, interpolated)
    3. Normalize to standard schema
    4. Compare to seasonal baselines (from zone config)
  - Output: `{ normalized: NormReading[], quality_flags: Flag[] }`
  - JSON response format from Grok
  - Log activity to agent_logs via Dev's DB service
  - Update agent status via `agentState.js`

### Detection Agent
- [ ] Create `detectionAgent.js`:
  - System prompt:
    ```
    You are a statistical anomaly detection expert for marine environments.
    Analyze the following normalized sensor data against seasonal baselines.
    Score each potential anomaly 0-100 based on:
    - Signal magnitude (30%): How far above threshold?
    - Temporal persistence (25%): How many consecutive anomalous readings?
    - Multi-metric convergence (20%): Do multiple metrics agree?
    - Historical pattern match (15%): Does this match known event signatures?
    - Cross-zone correlation (10%): Related signals in adjacent zones?
    
    Classify each anomaly type: thermal_spike, bloom_signature, hypoxia,
    bleaching_risk, acidification, sea_level, water_quality, weather_extreme.
    
    Return JSON with reasoning for each scored anomaly.
    ```
  - Input: normalized readings + zone baselines + last 7 days history
  - Output: `{ anomalies: [{ zone_id, type, score, confidence, reasoning }] }`
  - Discard anything with score < 30
  - Log to agent_logs, update agent status
- [ ] Test both agents with sample data independently
- [ ] **GIT PUSH:** `feat/agent-detection`

---

## Phase 3: Triage & Brief Agents + Rule-Based Agents (Hour 5–9)

### Triage Agent (LLM)
- [ ] Create `triageAgent.js`:
  - System prompt:
    ```
    You are an environmental operations commander. Your job is to SUPPRESS
    noise and ESCALATE only what truly matters.
    
    Given detected anomalies with scores and correlations, decide:
    - ESCALATE (critical/warning): convergent evidence, high confidence, actionable
    - SUPPRESS: low confidence, redundant, known noise pattern
    - WATCH: moderate signal, needs more data
    
    Target: suppress at least 60-70% of incoming anomalies.
    For each decision, explain your reasoning.
    ```
  - Input: anomalies + correlations + zone sensitivity values
  - Apply sensitivity multiplier to scores before sending to Grok
  - Output: `{ escalated: [], suppressed: [], watch: [] }`

### Brief Agent (LLM)
- [ ] Create `briefAgent.js`:
  - System prompt:
    ```
    You are an environmental policy advisor. Generate clear, actionable
    intelligence briefings for marine operators.
    
    For each escalated alert, provide:
    1. SITUATION: What is happening (plain language, specific numbers)
    2. EVIDENCE: Supporting metrics with deviations
    3. RECOMMENDED ACTIONS: 2-3 specific, immediate actions
    4. POTENTIAL IMPACT: What happens if this is ignored
    5. CONFIDENCE: Your confidence assessment with reasoning
    ```
  - Input: escalated alerts + zone context + correlations
  - Output: `{ briefs: [{ zone_id, summary, actions, impact }] }`
  - Also exports `queryBriefAgent(message, context)` for chat queries
    - This function: takes user message + current system state → streams response

### Correlation Agent (Rule-Based)
- [ ] Create `correlationAgent.js`:
  - **NO LLM** — pure JavaScript logic
  - Zone adjacency matrix (hardcoded):
    ```js
    const ADJACENCY = {
      Z1: ['Z5', 'Z7'],      // Lakshadweep ↔ Andaman, Goa
      Z2: ['Z4', 'Z7'],      // Gujarat ↔ Mumbai, Goa
      Z3: ['Z4', 'Z7'],      // Kerala ↔ Mumbai, Goa
      Z4: ['Z2', 'Z3', 'Z7'],// Mumbai ↔ Gujarat, Kerala, Goa
      Z5: ['Z1', 'Z8'],      // Andaman ↔ Lakshadweep, Sri Lanka
      Z6: ['Z5'],             // Sundarbans ↔ Andaman
      Z7: ['Z1', 'Z2', 'Z3'],// Goa ↔ Lakshadweep, Gujarat, Kerala
      Z8: ['Z5', 'Z1'],      // Sri Lanka ↔ Andaman, Lakshadweep
    };
    ```
  - Rule: If Zone A has anomaly type X detected within 48h window AND adjacent Zone B has anomaly type Y → create correlation
  - Correlation types: `preceded_by`, `correlated_with`
  - Write correlations to Neo4j via Dev's `neo4jClient.js`
  - Output: `{ correlations: [{ from, to, type, confidence }] }`

### Dispatch Agent (Rule-Based)
- [ ] Create `dispatchAgent.js`:
  - **NO LLM** — rule engine
  - Rules:
    - `severity === 'critical'` → email + dashboard + mark priority
    - `severity === 'warning'` → dashboard + email
    - `severity === 'watch'` → dashboard only
  - For email dispatch: call Dev's `emailRunner.js`
  - Output: `{ emails_sent: [], dashboard_updates: [] }`

### Learning Agent (Rule-Based)
- [ ] Create `learningAgent.js`:
  - **NO LLM** — simple math
  - Input: alert_outcomes (feedback) from DB
  - Logic:
    ```js
    if (feedback.was_valid) sensitivity *= 1.05;  // +5%
    else sensitivity *= 0.90;                      // -10%
    sensitivity = Math.max(0.3, Math.min(2.0, sensitivity));
    ```
  - Update zone sensitivity in Neon DB via Dev's service
  - Output: `{ updated_sensitivities: [{ zone_id, old, new }] }`

- [ ] **GIT PUSH:** `feat/agent-pipeline`

---

## Phase 4: LangGraph Orchestrator (Hour 9–12)

- [ ] Create `orchestrator.js` — the state machine:
  ```js
  import { StateGraph } from '@langchain/langgraph';
  
  // Define state schema
  // Define nodes (each agent is a node)
  // Define edges: ingest → detect → correlate → triage → [brief, dispatch] → learn
  // Compile graph
  // Export: runPipeline(readings, eventEmitter) → final state
  ```
- [ ] Wire all 7 agents as graph nodes:
  - Each node function: receives state → calls agent → returns updated state
  - Each node: updates agentState status (processing → idle)
  - Each node: emits SSE events via eventEmitter callback
- [ ] Implement event emission interface:
  ```js
  export async function runPipeline(readings, onEvent) {
    // onEvent('agent_status', { agent: 'ingestion', status: 'processing' })
    // onEvent('anomaly_detected', { zone_id, type, score })
    // etc.
  }
  ```
- [ ] Test full pipeline: feed sample data → all 7 agents execute → get final state
- [ ] Test SSE events: verify all event types fire correctly
- [ ] **GIT PUSH:** `feat/orchestrator`

---

## Phase 5: Prompt Tuning & Demo Scenario (Hour 12–14)

- [ ] Run pipeline with Dev's "Arabian Sea Crisis" demo data
- [ ] Tune Detection Agent prompt:
  - Coral Bay thermal buildup should score 85+
  - Gujarat HAB should score 70+
  - Noise zones (7, 8) should score < 30
- [ ] Tune Triage Agent prompt:
  - Should suppress Zones 7, 8 alerts
  - Should escalate Zone 1 (critical), Zone 3 (warning)
  - Target: 60-70% suppression rate
- [ ] Tune Brief Agent prompt:
  - Briefings should be 3-5 sentences, clear, actionable
  - Chat responses should feel natural and informed
- [ ] Test "What needs attention right now?" query → verify ranked response
- [ ] Test zone-specific queries: "Tell me about Lakshadweep"
- [ ] Add fallback responses for when Grok API is slow/down
- [ ] Cache demo scenario responses for reliable demo
- [ ] **GIT PUSH:** `feat/agent-prompts`

---

## Dependencies on Other Team Members

| I need from | What | When |
|---|---|---|
| **Dev** | `neonDb.js` (db.query), `neo4jClient.js` (run cypher), `emailRunner.js` | Phase 3+ |
| **Siddh** | Agent deps installed in server/package.json | Phase 1 |
| **Het** | Nothing (Het consumes my agents via Siddh's routes) | — |

## Packages Avani Needs (tell Siddh to install)
```
openai, @langchain/core, @langchain/langgraph, @langchain/openai
```
