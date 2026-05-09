// ═══════════════════════════════════════════════════════════════
// AquaSentinel — Neon Postgres Service Client
// Exports: db { query, getZones, getReadings, insertAnomaly, ... }
// Consumers: Siddh (routes), Avani (agents)
// ═══════════════════════════════════════════════════════════════

import pg from 'pg';
const { Pool } = pg;

// ───────────────────────────────────────────
// Connection pool with SSL for Neon
// ───────────────────────────────────────────
let pool;
try {
  const connStr = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  pool = new Pool({
    connectionString: connStr,
    ssl: connStr ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  pool.on('error', (err) => {
    console.error('[neonDb] Unexpected pool error:', err.message);
  });
} catch (err) {
  console.error('[neonDb] Failed to create pool:', err.message);
}

// Graceful query wrapper — returns empty result on failure
async function safeQuery(text, params) {
  if (!pool) {
    console.warn('[neonDb] No pool — returning empty result');
    return { rows: [], rowCount: 0 };
  }
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error(`[neonDb] Query error: ${err.message}`);
    throw err;
  }
}

// ───────────────────────────────────────────
// Exported db object — all convenience methods
// ───────────────────────────────────────────
export const db = {
  close: () => pool.end(),

  // ─── Raw query ───
  query: (text, params) => safeQuery(text, params),

  // ─── Zone queries ───
  getZones: () =>
    safeQuery('SELECT * FROM zones ORDER BY id'),

  getZone: (id) =>
    safeQuery('SELECT * FROM zones WHERE id = $1', [id]),

  // ─── Reading queries ───
  getReadings: (zoneId, limit = 100) =>
    safeQuery(
      'SELECT * FROM readings WHERE zone_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [zoneId, limit]
    ),

  getLatestReadings: () =>
    safeQuery(`
      SELECT DISTINCT ON (zone_id) *
      FROM readings
      ORDER BY zone_id, timestamp DESC
    `),

  getTimeSeries: (zoneId, metric, days = 30) => {
    // Whitelist metrics to prevent SQL injection
    const allowedMetrics = [
      'sst', 'chlorophyll', 'dissolved_o2', 'turbidity',
      'ph', 'salinity', 'wind_speed', 'wave_height',
    ];
    const safeMetric = allowedMetrics.includes(metric) ? metric : 'sst';
    return safeQuery(
      `SELECT timestamp, ${safeMetric} as value
       FROM readings
       WHERE zone_id = $1
         AND timestamp > NOW() - INTERVAL '${parseInt(days)} days'
       ORDER BY timestamp`,
      [zoneId]
    );
  },

  // ─── Write operations ───
  insertReading: (r) =>
    safeQuery(
      `INSERT INTO readings
        (zone_id, timestamp, sst, chlorophyll, dissolved_o2, turbidity, ph, salinity, wind_speed, wave_height)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [r.zone_id, r.timestamp, r.sst, r.chlorophyll, r.dissolved_o2,
       r.turbidity, r.ph, r.salinity, r.wind_speed, r.wave_height]
    ),

  insertAnomaly: (a) =>
    safeQuery(
      `INSERT INTO anomalies
        (zone_id, anomaly_type, severity, confidence, score, reasoning, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [a.zone_id, a.anomaly_type, a.severity, a.confidence,
       a.score, a.reasoning, a.status || 'active']
    ),

  updateZoneSensitivity: (id, sensitivity) =>
    safeQuery(
      'UPDATE zones SET sensitivity = $1 WHERE id = $2 RETURNING *',
      [sensitivity, id]
    ),

  // ─── Agent & email logging ───
  insertAgentLog: (log) =>
    safeQuery(
      `INSERT INTO agent_logs
        (agent_name, action, input_summary, output_summary, processing_time_ms)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [log.agent_name, log.action, log.input_summary,
       log.output_summary, log.processing_time_ms]
    ),

  insertEmailLog: (log) =>
    safeQuery(
      `INSERT INTO email_logs
        (anomaly_id, recipient, subject, body, status)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [log.anomaly_id, log.recipient, log.subject, log.body, log.status || 'sent']
    ),

  // ─── Query methods (read) ───
  getActiveAnomalies: () =>
    safeQuery(
      `SELECT a.*, z.name as zone_name
       FROM anomalies a
       JOIN zones z ON a.zone_id = z.id
       WHERE a.status = 'active'
       ORDER BY a.score DESC`
    ),

  submitFeedback: (anomalyId, wasValid, notes) =>
    safeQuery(
      `INSERT INTO alert_outcomes (anomaly_id, was_valid, feedback_notes)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [anomalyId, wasValid, notes]
    ),

  getAlertStats: () =>
    safeQuery(`
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'suppressed')::int as suppressed,
        COUNT(*) FILTER (WHERE status = 'escalated')::int as escalated,
        COUNT(*) FILTER (WHERE status = 'resolved')::int as resolved
      FROM anomalies
    `),

  getAgentLogs: (limit = 50) =>
    safeQuery(
      'SELECT * FROM agent_logs ORDER BY timestamp DESC LIMIT $1',
      [limit]
    ),

  getEmailLogs: () =>
    safeQuery(
      'SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 20'
    ),

  // ─── Additional methods for agents/routes ───
  getAnomaliesByZone: (zoneId, status) => {
    if (status) {
      return safeQuery(
        `SELECT a.*, z.name as zone_name FROM anomalies a
         JOIN zones z ON a.zone_id = z.id
         WHERE a.zone_id = $1 AND a.status = $2
         ORDER BY a.detected_at DESC`,
        [zoneId, status]
      );
    }
    return safeQuery(
      `SELECT a.*, z.name as zone_name FROM anomalies a
       JOIN zones z ON a.zone_id = z.id
       WHERE a.zone_id = $1
       ORDER BY a.detected_at DESC`,
      [zoneId]
    );
  },

  updateAnomalyStatus: (id, status, suppressedBy = null) =>
    safeQuery(
      `UPDATE anomalies SET status = $1, suppressed_by = $2,
       resolved_at = CASE WHEN $1 = 'resolved' THEN NOW() ELSE resolved_at END
       WHERE id = $3 RETURNING *`,
      [status, suppressedBy, id]
    ),

  getReadingsByTimeRange: (zoneId, from, to) =>
    safeQuery(
      `SELECT * FROM readings
       WHERE zone_id = $1 AND timestamp >= $2 AND timestamp <= $3
       ORDER BY timestamp`,
      [zoneId, from, to]
    ),

  // ─── Health & lifecycle ───
  healthCheck: async () => {
    try {
      const res = await safeQuery('SELECT NOW() as time');
      return { connected: true, time: res.rows[0]?.time };
    } catch {
      return { connected: false };
    }
  },

  end: () => pool ? pool.end() : Promise.resolve(),
};

export default db;
