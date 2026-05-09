import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const { rows } = await pool.query('SELECT id, zone_id, anomaly_type, severity, status FROM anomalies ORDER BY id');
console.log(JSON.stringify(rows, null, 2));
await pool.end();
