// ═══════════════════════════════════════════════════════════════
// AquaSentinel — Supabase Database Setup (Schema + Seed)
// Run: node scripts/setup_db.js
// ═══════════════════════════════════════════════════════════════

import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 15000,
});

// ─── Zone data (matches client/src/data/zones.js) ───
const ZONES = [
  { id: 1, name: 'Lakshadweep Coral Reef', region: 'Arabian Sea', lat: 10.57, lng: 72.63,
    polygon: [[10.8,72.3],[10.8,73.0],[10.3,73.0],[10.3,72.3]],
    baseline: { sst: 28.0, chlorophyll: 0.3, dissolved_o2: 6.5, ph: 8.1, turbidity: 1.5, salinity: 35.0 } },
  { id: 2, name: 'Gujarat Mangrove Coast', region: 'Gulf of Khambhat', lat: 21.63, lng: 72.18,
    polygon: [[22.0,71.8],[22.0,72.6],[21.3,72.6],[21.3,71.8]],
    baseline: { sst: 27.5, chlorophyll: 0.9, dissolved_o2: 6.0, ph: 8.05, turbidity: 4.0, salinity: 34.5 } },
  { id: 3, name: 'Kerala Upwelling Zone', region: 'Arabian Sea', lat: 9.93, lng: 76.26,
    polygon: [[10.2,75.9],[10.2,76.6],[9.6,76.6],[9.6,75.9]],
    baseline: { sst: 27.8, chlorophyll: 0.5, dissolved_o2: 5.5, ph: 8.08, turbidity: 2.0, salinity: 34.8 } },
  { id: 4, name: 'Mumbai Offshore', region: 'Arabian Sea', lat: 19.07, lng: 72.87,
    polygon: [[19.4,72.5],[19.4,73.2],[18.7,73.2],[18.7,72.5]],
    baseline: { sst: 27.2, chlorophyll: 0.7, dissolved_o2: 6.2, ph: 8.1, turbidity: 3.1, salinity: 35.2 } },
  { id: 5, name: 'Andaman Reef System', region: 'Bay of Bengal', lat: 11.74, lng: 92.66,
    polygon: [[12.1,92.3],[12.1,93.0],[11.4,93.0],[11.4,92.3]],
    baseline: { sst: 28.5, chlorophyll: 0.2, dissolved_o2: 6.8, ph: 8.12, turbidity: 0.8, salinity: 33.5 } },
  { id: 6, name: 'Sundarbans Delta', region: 'Bay of Bengal', lat: 21.94, lng: 89.18,
    polygon: [[22.2,88.8],[22.2,89.5],[21.6,89.5],[21.6,88.8]],
    baseline: { sst: 27.0, chlorophyll: 1.2, dissolved_o2: 5.8, ph: 7.95, turbidity: 8.0, salinity: 28.0 } },
  { id: 7, name: 'Goa Coastal Strip', region: 'Arabian Sea', lat: 15.49, lng: 73.82,
    polygon: [[15.8,73.5],[15.8,74.1],[15.2,74.1],[15.2,73.5]],
    baseline: { sst: 27.5, chlorophyll: 0.4, dissolved_o2: 6.3, ph: 8.1, turbidity: 2.5, salinity: 35.0 } },
  { id: 8, name: 'Sri Lanka Southern Coast', region: 'Indian Ocean', lat: 6.03, lng: 80.22,
    polygon: [[6.3,79.9],[6.3,80.5],[5.7,80.5],[5.7,79.9]],
    baseline: { sst: 28.2, chlorophyll: 0.3, dissolved_o2: 6.4, ph: 8.1, turbidity: 1.2, salinity: 34.5 } },
];

// ─── Synthetic reading generator ───
function generateReadings(days = 30) {
  const readings = [];
  const now = new Date();
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  for (const zone of ZONES) {
    const b = zone.baseline;
    for (let d = 0; d < days; d++) {
      for (let h = 0; h < 24; h++) {
        const ts = new Date(start.getTime() + (d * 24 + h) * 60 * 60 * 1000);
        const drift = (d / days) * 0.5; // gradual drift
        const noise = () => (Math.random() - 0.5) * 0.4;
        
        readings.push({
          zone_id: zone.id,
          timestamp: ts.toISOString(),
          sst: +(b.sst + drift + noise()).toFixed(2),
          chlorophyll: +(b.chlorophyll + drift * 0.2 + noise() * 0.1).toFixed(4),
          dissolved_o2: +(b.dissolved_o2 - drift * 0.3 + noise() * 0.2).toFixed(2),
          turbidity: +(b.turbidity + noise() * 0.5).toFixed(2),
          ph: +(b.ph + noise() * 0.05).toFixed(2),
          salinity: +(b.salinity + noise() * 0.2).toFixed(2),
          wind_speed: +(5 + Math.random() * 10).toFixed(2),
          wave_height: +(0.5 + Math.random() * 2).toFixed(2),
        });
      }
    }
  }
  return readings;
}

async function runSchema() {
  console.log('📋 Running schema...');
  const sql = readFileSync(join(__dirname, '..', 'db', 'schema.sql'), 'utf-8');
  await pool.query(sql);
  console.log('✅ Schema created (6 tables)');
}

async function seedZones() {
  console.log('🌊 Seeding 8 zones...');
  for (const zone of ZONES) {
    await pool.query(
      `INSERT INTO zones (id, name, region, lat, lng, polygon, baseline_config, sensitivity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, region = EXCLUDED.region,
         lat = EXCLUDED.lat, lng = EXCLUDED.lng`,
      [zone.id, zone.name, zone.region, zone.lat, zone.lng,
       JSON.stringify(zone.polygon), JSON.stringify(zone.baseline), 1.0]
    );
  }
  console.log(`✅ Seeded ${ZONES.length} zones`);
}

async function seedReadings() {
  console.log('📡 Generating 30 days × 8 zones × 24h of synthetic readings...');
  const readings = generateReadings(30);
  console.log(`⏳ Inserting ${readings.length} readings in batches...`);

  const BATCH_SIZE = 200;
  let inserted = 0;

  for (let i = 0; i < readings.length; i += BATCH_SIZE) {
    const batch = readings.slice(i, i + BATCH_SIZE);
    const values = [];
    const placeholders = [];

    batch.forEach((r, idx) => {
      const offset = idx * 10;
      placeholders.push(
        `($${offset+1},$${offset+2},$${offset+3},$${offset+4},$${offset+5},$${offset+6},$${offset+7},$${offset+8},$${offset+9},$${offset+10})`
      );
      values.push(
        r.zone_id, r.timestamp, r.sst, r.chlorophyll,
        r.dissolved_o2, r.turbidity, r.ph, r.salinity,
        r.wind_speed, r.wave_height
      );
    });

    await pool.query(
      `INSERT INTO readings (zone_id, timestamp, sst, chlorophyll, dissolved_o2, turbidity, ph, salinity, wind_speed, wave_height)
       VALUES ${placeholders.join(',')}`,
      values
    );
    inserted += batch.length;
    if (inserted % 1000 === 0 || inserted === readings.length) {
      console.log(`   ... ${inserted}/${readings.length}`);
    }
  }
  console.log(`✅ Seeded ${inserted} readings`);
}

async function seedAnomalies() {
  console.log('🔍 Seeding anomalies...');
  const anomalies = [
    { zone_id: 1, anomaly_type: 'thermal_spike', severity: 'critical', confidence: 87, score: 91,
      reasoning: 'SST +1.8°C above 30-day baseline for 8 consecutive days. Degree Heating Weeks approaching 6.2. Coral bleaching risk HIGH.', status: 'active' },
    { zone_id: 2, anomaly_type: 'harmful_algal_bloom', severity: 'warning', confidence: 72, score: 78,
      reasoning: 'Chlorophyll-a at 3.2× baseline (0.9→2.88 mg/m³). Noctiluca scintillans bloom signature detected. DO declining 0.3 mg/L/day.', status: 'active' },
    { zone_id: 3, anomaly_type: 'hypoxia_warning', severity: 'warning', confidence: 68, score: 74,
      reasoning: 'Dissolved oxygen declining 0.15 mg/L/day for 10 days. Current level 3.2 mg/L approaching hypoxic threshold (2.0 mg/L).', status: 'active' },
    { zone_id: 4, anomaly_type: 'water_quality_alert', severity: 'watch', confidence: 54, score: 59,
      reasoning: 'Turbidity elevated 9.3 NTU above 3.1 NTU baseline. Correlated with upstream runoff and Kerala upwelling event.', status: 'active' },
    { zone_id: 5, anomaly_type: 'coral_bleaching_risk', severity: 'watch', confidence: 45, score: 52,
      reasoning: 'SST trending +0.2°C/day since day 25. Lagging Lakshadweep thermal pattern by 3 days. Cross-zone correlation at 82%.', status: 'active' },
    { zone_id: 6, anomaly_type: 'acidification_event', severity: 'watch', confidence: 41, score: 47,
      reasoning: 'pH dropped from 7.95 to 7.93 over 2 days. Salinity simultaneously increasing. Freshwater-marine mixing disruption detected.', status: 'active' },
    { zone_id: 7, anomaly_type: 'chlorophyll_noise', severity: 'normal', confidence: 28, score: 32,
      reasoning: 'Chlorophyll oscillation 0.4-0.5 mg/m³ matches natural monsoon pre-season pattern. No anthropogenic bloom signature detected.', status: 'suppressed' },
    { zone_id: 8, anomaly_type: 'sst_variation', severity: 'normal', confidence: 22, score: 25,
      reasoning: 'SST and wind speed variations within 2σ of normal weather pattern shifts for this season.', status: 'suppressed' },
  ];

  for (const a of anomalies) {
    await pool.query(
      `INSERT INTO anomalies (zone_id, anomaly_type, severity, confidence, score, reasoning, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [a.zone_id, a.anomaly_type, a.severity, a.confidence, a.score, a.reasoning, a.status]
    );
  }
  console.log(`✅ Seeded ${anomalies.length} anomalies`);
}

async function seedAgentLogs() {
  console.log('🤖 Seeding agent logs...');
  const logs = [
    { agent: 'ingestion', action: 'normalize_readings', input: '8 zone readings received', output: '8 normalized, 0 flagged', ms: 320 },
    { agent: 'detection', action: 'detect_anomalies', input: '8 normalized zone signals', output: '6 anomalies detected (1 critical, 2 warning, 3 watch)', ms: 1250 },
    { agent: 'correlation', action: 'correlate_cross_zone', input: '6 anomalies, adjacency matrix', output: '2 cross-zone correlations (Z1→Z5, Z3→Z4)', ms: 180 },
    { agent: 'triage', action: 'triage_alerts', input: '6 anomalies + 2 correlations', output: '6 escalated, 2 suppressed (25% noise reduction)', ms: 890 },
    { agent: 'brief', action: 'generate_brief', input: '6 escalated alerts', output: 'Intelligence briefings generated for Z1, Z2, Z3', ms: 2100 },
    { agent: 'dispatch', action: 'send_critical_email', input: 'Z1 critical thermal alert', output: 'Email dispatched to marine ops team', ms: 340 },
    { agent: 'learning', action: 'update_sensitivity', input: 'Z7, Z8 false positive feedback', output: 'Z7 sensitivity 1.0→0.8, Z8 unchanged', ms: 120 },
  ];

  for (const l of logs) {
    await pool.query(
      `INSERT INTO agent_logs (agent_name, action, input_summary, output_summary, processing_time_ms)
       VALUES ($1,$2,$3,$4,$5)`,
      [l.agent, l.action, l.input, l.output, l.ms]
    );
  }
  console.log(`✅ Seeded ${logs.length} agent logs`);
}

async function verify() {
  console.log('\n📊 Verification:');
  const tables = ['zones', 'readings', 'anomalies', 'agent_logs'];
  for (const t of tables) {
    const res = await pool.query(`SELECT COUNT(*)::int as count FROM ${t}`);
    console.log(`   ${t}: ${res.rows[0].count} rows`);
  }
}

async function main() {
  console.log('\n🌊 ════════════════════════════════════════');
  console.log('   AquaSentinel — Supabase Database Setup');
  console.log('════════════════════════════════════════\n');

  try {
    const res = await pool.query('SELECT NOW() as now');
    console.log(`📡 Connected to Supabase at ${res.rows[0].now}\n`);

    await runSchema();
    await seedZones();
    await seedReadings();
    await seedAnomalies();
    await seedAgentLogs();
    await verify();

    console.log('\n✅ Full database setup complete!\n');
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
