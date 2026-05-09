// ═══════════════════════════════════════════════════════════════
// AquaSentinel — Seed Neon Postgres
// Run: node scripts/seed_neon.js
// Requires: NEON_DATABASE_URL in .env
// ═══════════════════════════════════════════════════════════════

import 'dotenv/config';
import pg from 'pg';
import { ZONES } from '../server/src/data/zones.js';
import { generateAllReadings } from '../server/src/data/syntheticGenerator.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seedZones() {
  console.log('⏳ Seeding zones...');
  for (const zone of ZONES) {
    await pool.query(
      `INSERT INTO zones (id, name, region, lat, lng, polygon, baseline_config, sensitivity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         region = EXCLUDED.region,
         lat = EXCLUDED.lat,
         lng = EXCLUDED.lng,
         polygon = EXCLUDED.polygon,
         baseline_config = EXCLUDED.baseline_config`,
      [
        zone.id, zone.name, zone.region, zone.lat, zone.lng,
        JSON.stringify(zone.polygon),
        JSON.stringify(zone.baseline_config),
        1.0,
      ]
    );
  }
  console.log(`✅ Seeded ${ZONES.length} zones`);
}

async function seedReadings() {
  console.log('⏳ Generating synthetic readings...');
  const readings = generateAllReadings(30);
  console.log(`⏳ Inserting ${readings.length} readings (batch mode)...`);

  // Batch insert in chunks of 100 for performance
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < readings.length; i += BATCH_SIZE) {
    const batch = readings.slice(i, i + BATCH_SIZE);
    const values = [];
    const placeholders = [];

    batch.forEach((r, idx) => {
      const offset = idx * 10;
      placeholders.push(
        `($${offset + 1},$${offset + 2},$${offset + 3},$${offset + 4},$${offset + 5},$${offset + 6},$${offset + 7},$${offset + 8},$${offset + 9},$${offset + 10})`
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
    if (inserted % 500 === 0 || inserted === readings.length) {
      console.log(`   ... ${inserted}/${readings.length} readings inserted`);
    }
  }

  console.log(`✅ Seeded ${inserted} readings`);
}

async function main() {
  console.log('\n🌊 AquaSentinel — Neon Postgres Seeder\n');

  try {
    // Test connection
    const res = await pool.query('SELECT NOW()');
    console.log(`📡 Connected to Neon at ${res.rows[0].now}\n`);

    await seedZones();
    await seedReadings();

    // Verify counts
    const zoneCount = await pool.query('SELECT COUNT(*) FROM zones');
    const readingCount = await pool.query('SELECT COUNT(*) FROM readings');
    console.log(`\n📊 Verification: ${zoneCount.rows[0].count} zones, ${readingCount.rows[0].count} readings`);

    console.log('\n✅ Seeding complete!\n');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
