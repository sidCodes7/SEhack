-- ═══════════════════════════════════════════════════════════════
-- AquaSentinel — Neon Postgres Schema
-- Run against your Neon project: psql $NEON_DATABASE_URL < db/schema.sql
-- ═══════════════════════════════════════════════════════════════

-- Drop existing tables (for clean re-seeding)
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS alert_outcomes CASCADE;
DROP TABLE IF EXISTS agent_logs CASCADE;
DROP TABLE IF EXISTS anomalies CASCADE;
DROP TABLE IF EXISTS readings CASCADE;
DROP TABLE IF EXISTS zones CASCADE;

-- ───────────────────────────────────────────
-- Monitored zones (8 coastal/marine zones)
-- ───────────────────────────────────────────
CREATE TABLE zones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  lat DECIMAL(10, 6),
  lng DECIMAL(10, 6),
  polygon JSONB,
  baseline_config JSONB,
  sensitivity DECIMAL(3, 2) DEFAULT 1.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ───────────────────────────────────────────
-- Time-series sensor data (hourly readings)
-- ───────────────────────────────────────────
CREATE TABLE readings (
  id SERIAL PRIMARY KEY,
  zone_id INT REFERENCES zones(id) ON DELETE CASCADE,
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

-- Index for fast time-series queries by zone
CREATE INDEX idx_readings_zone_time ON readings (zone_id, timestamp DESC);
-- Index for latest-per-zone DISTINCT ON queries
CREATE INDEX idx_readings_zone_id ON readings (zone_id);

-- ───────────────────────────────────────────
-- Detected anomalies
-- ───────────────────────────────────────────
CREATE TABLE anomalies (
  id SERIAL PRIMARY KEY,
  zone_id INT REFERENCES zones(id) ON DELETE CASCADE,
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

CREATE INDEX idx_anomalies_zone ON anomalies (zone_id);
CREATE INDEX idx_anomalies_status ON anomalies (status);

-- ───────────────────────────────────────────
-- Alert feedback (Learning Agent input)
-- ───────────────────────────────────────────
CREATE TABLE alert_outcomes (
  id SERIAL PRIMARY KEY,
  anomaly_id INT REFERENCES anomalies(id) ON DELETE CASCADE,
  was_valid BOOLEAN,
  feedback_notes TEXT,
  feedback_at TIMESTAMPTZ DEFAULT NOW()
);

-- ───────────────────────────────────────────
-- Agent activity log (automation timeline)
-- ───────────────────────────────────────────
CREATE TABLE agent_logs (
  id SERIAL PRIMARY KEY,
  agent_name VARCHAR(50) NOT NULL,
  action VARCHAR(100),
  input_summary TEXT,
  output_summary TEXT,
  processing_time_ms INT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_logs_time ON agent_logs (timestamp DESC);

-- ───────────────────────────────────────────
-- Email dispatch log
-- ───────────────────────────────────────────
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  anomaly_id INT REFERENCES anomalies(id) ON DELETE SET NULL,
  recipient VARCHAR(255),
  subject VARCHAR(255),
  body TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'sent'
);

-- ═══════════════════════════════════════════════════════════════
-- Schema complete. Tables: zones, readings, anomalies,
-- alert_outcomes, agent_logs, email_logs
-- ═══════════════════════════════════════════════════════════════
