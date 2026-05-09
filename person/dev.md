# 📊 Dev — Data & Integration Lead

> **Ownership:** `server/src/services/`, `server/src/data/`, `scripts/`, `db/`, `.env.example`
> **Tech:** Neon Postgres (pg), Neo4j (neo4j-driver), Python (smtplib), synthetic data generation
> **Zero conflict zone:** Dev never touches `client/`, `server/src/routes/`, or `server/src/agents/`

---

## Phase 1: Database Setup & Service Clients (Hour 0–2)

- [ ] Tell Siddh to install these in `server/package.json`:
  ```bash
  npm install pg neo4j-driver
  ```
- [ ] Create `.env.example` at project root:
  ```
  XAI_API_KEY=
  NEON_DATABASE_URL=
  NEO4J_URI=
  NEO4J_USER=
  NEO4J_PASSWORD=
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=
  SMTP_PASS=
  ALERT_EMAIL_TO=
  ```
- [ ] Create `db/schema.sql` — full Neon Postgres schema:
  ```sql
  CREATE TABLE zones (...);
  CREATE TABLE readings (...);
  CREATE TABLE anomalies (...);
  CREATE TABLE alert_outcomes (...);
  CREATE TABLE agent_logs (...);
  CREATE TABLE email_logs (...);
  ```
  (Copy exact schema from `implementation.md`)
- [ ] Create `db/neo4j-schema.cypher`:
  ```cypher
  // Create zone nodes
  CREATE (:Zone {id: 'Z1', name: 'Lakshadweep Coral Reef', ...})
  // ... all 8 zones
  // Create adjacency relationships
  // Create metric nodes
  ```
- [ ] Provision Neon DB (via neon.tech console) — create database `aquasentinel`
- [ ] Run `schema.sql` against Neon DB
- [ ] Provision Neo4j Aura Free (via neo4j.io console) — create instance
- [ ] Run `neo4j-schema.cypher` against Neo4j
- [ ] Create `server/src/services/neonDb.js`:
  ```js
  import pg from 'pg';
  const { Pool } = pg;
  
  const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  
  export const db = {
    query: (text, params) => pool.query(text, params),
    
    // Convenience methods
    getZones: () => pool.query('SELECT * FROM zones ORDER BY id'),
    getZone: (id) => pool.query('SELECT * FROM zones WHERE id = $1', [id]),
    getReadings: (zoneId, limit = 100) => pool.query(
      'SELECT * FROM readings WHERE zone_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [zoneId, limit]
    ),
    getLatestReadings: () => pool.query(`
      SELECT DISTINCT ON (zone_id) * FROM readings 
      ORDER BY zone_id, timestamp DESC
    `),
    insertReading: (reading) => pool.query(
      'INSERT INTO readings (zone_id, timestamp, sst, chlorophyll, dissolved_o2, turbidity, ph, salinity, wind_speed, wave_height) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [reading.zone_id, reading.timestamp, reading.sst, reading.chlorophyll, reading.dissolved_o2, reading.turbidity, reading.ph, reading.salinity, reading.wind_speed, reading.wave_height]
    ),
    insertAnomaly: (a) => pool.query(
      'INSERT INTO anomalies (zone_id, anomaly_type, severity, confidence, score, reasoning, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [a.zone_id, a.anomaly_type, a.severity, a.confidence, a.score, a.reasoning, a.status]
    ),
    updateZoneSensitivity: (id, sensitivity) => pool.query(
      'UPDATE zones SET sensitivity = $1 WHERE id = $2 RETURNING *',
      [sensitivity, id]
    ),
    insertAgentLog: (log) => pool.query(
      'INSERT INTO agent_logs (agent_name, action, input_summary, output_summary, processing_time_ms) VALUES ($1,$2,$3,$4,$5)',
      [log.agent_name, log.action, log.input_summary, log.output_summary, log.processing_time_ms]
    ),
    insertEmailLog: (log) => pool.query(
      'INSERT INTO email_logs (anomaly_id, recipient, subject, body, status) VALUES ($1,$2,$3,$4,$5)',
      [log.anomaly_id, log.recipient, log.subject, log.body, log.status]
    ),
    getActiveAnomalies: () => pool.query(
      "SELECT a.*, z.name as zone_name FROM anomalies a JOIN zones z ON a.zone_id = z.id WHERE a.status = 'active' ORDER BY a.score DESC"
    ),
    submitFeedback: (anomalyId, wasValid, notes) => pool.query(
      'INSERT INTO alert_outcomes (anomaly_id, was_valid, feedback_notes) VALUES ($1,$2,$3)',
      [anomalyId, wasValid, notes]
    ),
  };
  
  export default db;
  ```
- [ ] Create `server/src/services/neo4jClient.js`:
  ```js
  import neo4j from 'neo4j-driver';
  
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
  );
  
  export const graph = {
    run: async (cypher, params = {}) => {
      const session = driver.session();
      try {
        const result = await session.run(cypher, params);
        return result.records.map(r => r.toObject());
      } finally { await session.close(); }
    },
    
    getNodes: (type) => ...,
    getEdges: () => ...,
    getZoneSubgraph: (zoneId) => ...,
    addEvent: (event) => ...,
    addCorrelation: (from, to, type, confidence) => ...,
    getCorrelations: (hours = 24) => ...,
  };
  
  export default graph;
  ```
- [ ] Create `server/src/services/emailRunner.js`:
  ```js
  import { exec } from 'child_process';
  import path from 'path';
  
  export function runEmailScript(alertData) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.cwd(), '..', 'scripts', 'email_alert.py');
      const dataJson = JSON.stringify(alertData).replace(/"/g, '\\"');
      exec(
        `python "${scriptPath}" "${dataJson}"`,
        (error, stdout, stderr) => {
          if (error) reject(error);
          else resolve(JSON.parse(stdout));
        }
      );
    });
  }
  ```
- [ ] Verify DB connections: Neon pool.query → success, Neo4j session.run → success
- [ ] **GIT PUSH:** `feat/data-layer`

---

## Phase 2: Synthetic Data Generator & Seeding (Hour 2–5)

- [ ] Create `server/src/data/zones.js` — zone definitions:
  ```js
  export const ZONES = [
    {
      id: 1, name: 'Lakshadweep Coral Reef', region: 'Arabian Sea',
      lat: 10.57, lng: 72.63,
      polygon: { /* GeoJSON polygon ~50km radius */ },
      baseline_config: {
        sst: { mean: 28.5, std: 0.8, seasonal_adj: [0, 0.2, 0.5, 0.8, 1.0, 0.8, 0.3, -0.2, -0.5, -0.3, 0, 0.1] },
        chlorophyll: { mean: 0.3, std: 0.1 },
        dissolved_o2: { mean: 6.5, std: 0.5 },
        // ... all 8 metrics with seasonal baselines
      }
    },
    // ... all 8 zones with real coordinates and realistic baselines
  ];
  ```
- [ ] Create `server/src/data/syntheticGenerator.js`:
  - Function: `generateReadings(zone, days = 30)` → Reading[]
  - Base: seasonal baseline + random noise (normal distribution)
  - **Zone-specific anomaly injections:**
    - Z1 (Lakshadweep): SST ramp +0.3°C/day starting day 22 (8-day buildup to demo)
    - Z2 (Gujarat): Chlorophyll spike 3× on day 27, increasing to 5× by day 30
    - Z3 (Kerala): Dissolved O₂ declining -0.15/day from day 20
    - Z4 (Mumbai): Normal but slight turbidity increase correlated with Z3 timing
    - Z5 (Andaman): SST anomaly starting day 25 (3 days after Z1, showing correlation)
    - Z6 (Sundarbans): pH drop starting day 28
    - Z7 (Goa): Normal with natural noise (chlorophyll fluctuations that mimic bloom)
    - Z8 (Sri Lanka): Normal with natural noise
  - Returns array of readings with timestamps, one per hour for 30 days
- [ ] Create `scripts/seed_neon.js`:
  ```js
  // 1. Insert all 8 zones
  // 2. Generate 30 days × 24 hours × 8 zones = 5,760 readings
  // 3. Batch insert readings (use COPY or multi-value INSERT)
  // 4. Report: "Seeded X zones, Y readings"
  ```
- [ ] Create `scripts/seed_neo4j.js`:
  ```js
  // 1. Create 8 Zone nodes
  // 2. Create adjacency relationships
  // 3. Create 8 Metric nodes (SST, Chlorophyll, DO, pH, Turbidity, Salinity, Wind, Waves)
  // 4. Report: "Seeded X nodes, Y relationships"
  ```
- [ ] Run seed scripts → verify data in both databases
- [ ] Create `server/src/data/generateNextReading.js`:
  - Function for simulation mode: generates next realistic reading per zone
  - Continues the anomaly trajectories from where seed data left off
  - Used by simulation loop to create "live" data
- [ ] **GIT PUSH:** `feat/seed-data`

---

## Phase 3: Python Email Scripts (Hour 5–7)

- [ ] Create `scripts/requirements.txt`:
  ```
  # No external deps needed — smtplib is stdlib
  ```
- [ ] Create `scripts/email_templates.py`:
  ```python
  def critical_template(alert_data):
      """Returns HTML string for critical alert email"""
      return f"""
      <html>
      <body style="background:#0a1628; color:#e2e8f0; font-family:Inter,sans-serif;">
        <div style="max-width:600px; margin:0 auto; padding:20px;">
          <div style="background:#ff3b5c22; border-left:4px solid #ff3b5c; padding:16px;">
            <h1 style="color:#ff3b5c;">🔴 CRITICAL ALERT</h1>
            <h2>{alert_data['zone_name']}: {alert_data['anomaly_type']}</h2>
          </div>
          <div style="padding:16px;">
            <h3>SITUATION</h3>
            <p>{alert_data['reasoning']}</p>
            <h3>EVIDENCE</h3>
            <ul>
              <li>Confidence: {alert_data['confidence']}%</li>
              <li>Score: {alert_data['score']}</li>
            </ul>
            <h3>RECOMMENDED ACTIONS</h3>
            <p>{alert_data.get('actions', 'Review dashboard for details.')}</p>
          </div>
          <hr style="border-color:#1e293b;">
          <p style="color:#475569; font-size:12px;">
            Automated alert from AquaSentinel
          </p>
        </div>
      </body>
      </html>
      """
  
  def warning_template(alert_data): ...
  def watch_template(alert_data): ...
  def daily_digest_template(summary_data): ...
  ```
- [ ] Create `scripts/email_alert.py`:
  ```python
  #!/usr/bin/env python3
  import sys, json, smtplib, os
  from email.mime.multipart import MIMEMultipart
  from email.mime.text import MIMEText
  from email_templates import critical_template, warning_template, watch_template
  
  def send_alert(alert_json):
      data = json.loads(alert_json)
      
      # Select template
      if data['severity'] == 'critical':
          html = critical_template(data)
      elif data['severity'] == 'warning':
          html = warning_template(data)
      else:
          html = watch_template(data)
      
      # Build email
      msg = MIMEMultipart('alternative')
      msg['Subject'] = f"{'🔴' if data['severity']=='critical' else '🟠'} AquaSentinel | {data['zone_name']}: {data['anomaly_type']}"
      msg['From'] = os.environ.get('SMTP_USER', 'alerts@aquasentinel.app')
      msg['To'] = data.get('recipient', os.environ.get('ALERT_EMAIL_TO'))
      msg.attach(MIMEText(html, 'html'))
      
      # Send
      with smtplib.SMTP(os.environ.get('SMTP_HOST', 'smtp.gmail.com'), 587) as server:
          server.starttls()
          server.login(os.environ['SMTP_USER'], os.environ['SMTP_PASS'])
          server.send_message(msg)
      
      print(json.dumps({"sent": True, "to": msg['To'], "subject": msg['Subject']}))
  
  if __name__ == '__main__':
      send_alert(sys.argv[1])
  ```
- [ ] Create `scripts/test_email.py` — quick test that sends to self
- [ ] Test email sending locally with Gmail App Password
- [ ] **GIT PUSH:** `feat/email-scripts`

---

## Phase 4: Service Refinement & Integration Support (Hour 7–10)

- [ ] Add time-series query methods to `neonDb.js`:
  ```js
  getTimeSeries: (zoneId, metric, days = 30) => pool.query(`
    SELECT timestamp, ${metric} as value 
    FROM readings WHERE zone_id = $1 
    AND timestamp > NOW() - INTERVAL '${days} days'
    ORDER BY timestamp
  `, [zoneId]),
  
  getAlertStats: () => pool.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'suppressed') as suppressed,
      COUNT(*) FILTER (WHERE status = 'escalated') as escalated,
      COUNT(*) FILTER (WHERE status = 'resolved') as resolved
    FROM anomalies
  `),
  
  getAgentLogs: (limit = 50) => pool.query(
    'SELECT * FROM agent_logs ORDER BY timestamp DESC LIMIT $1', [limit]
  ),
  
  getEmailLogs: () => pool.query(
    'SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 20'
  ),
  ```
- [ ] Add convenience methods to `neo4jClient.js`:
  ```js
  getNodes: async (type) => {
    return graph.run(`MATCH (n:${type}) RETURN n`);
  },
  getEdges: async () => {
    return graph.run('MATCH (a)-[r]->(b) RETURN a, type(r) as rel, r, b');
  },
  getZoneSubgraph: async (zoneId) => {
    return graph.run(
      'MATCH (z:Zone {id: $id})-[*1..2]-(connected) RETURN z, connected',
      { id: zoneId }
    );
  },
  addEvent: async (event) => {
    return graph.run(
      'CREATE (e:Event {id: $id, type: $type, severity: $severity, detected_at: datetime(), confidence: $confidence}) ' +
      'WITH e MATCH (z:Zone {id: $zone_id}) CREATE (e)-[:OCCURRED_IN]->(z) ' +
      'WITH e MATCH (m:Metric {name: $metric}) CREATE (e)-[:TRIGGERED_BY]->(m) RETURN e',
      event
    );
  },
  addCorrelation: async (fromEventId, toEventId, type, confidence) => {
    return graph.run(
      `MATCH (a:Event {id: $from}), (b:Event {id: $to}) 
       CREATE (a)-[:${type} {confidence: $conf}]->(b)`,
      { from: fromEventId, to: toEventId, conf: confidence }
    );
  },
  ```
- [ ] Verify all exports work when Siddh's routes and Avani's agents import them
- [ ] Ensure DB connection pooling handles concurrent agent calls
- [ ] **GIT PUSH:** `feat/service-refinement`

---

## Phase 5: Demo Data Polishing & Edge Cases (Hour 10–12)

- [ ] Verify demo scenario data tells the right story:
  - Z1 thermal buildup clearly visible in charts
  - Z2 HAB spike is dramatic and obvious
  - Z3 hypoxia trend is gradual and concerning
  - Z7/Z8 noise looks natural but doesn't trigger false alerts
- [ ] Add GeoJSON polygon data for all 8 zones (realistic ~50km coastal regions)
- [ ] Verify Neo4j adjacency graph matches the story (Z1↔Z5 correlation)
- [ ] Create a `scripts/reset_demo.js` — drops and re-seeds everything for clean demo
- [ ] Add connection error handling to all DB clients (graceful fallbacks)
- [ ] Test email preview generation without actually sending
- [ ] **GIT PUSH:** `feat/demo-data`

---

## Dependencies on Other Team Members

| I need from | What | When |
|---|---|---|
| **Siddh** | `pg` and `neo4j-driver` installed in server/package.json | Phase 1 |
| **Avani** | Nothing (Avani imports my services) | — |
| **Het** | Nothing (Het uses API, doesn't call my code) | — |

## Packages Dev Needs (tell Siddh to install in server/)
```
pg, neo4j-driver
```

## Accounts Dev Must Set Up
1. **Neon** — neon.tech → create project "aquasentinel" → copy connection string
2. **Neo4j Aura** — neo4j.io → create free instance → copy URI + credentials
3. **Gmail App Password** — Google Account → Security → App Passwords → create for "AquaSentinel"
