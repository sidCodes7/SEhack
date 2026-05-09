// ═══════════════════════════════════════════════════════════════
// AquaSentinel — Demo Reset Script
// Drops and re-seeds BOTH databases from scratch
// Run: node scripts/reset_demo.js
// ═══════════════════════════════════════════════════════════════

import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

async function resetNeon() {
  console.log('🗑️  Resetting Neon Postgres...');
  const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Read and execute schema.sql (includes DROP CASCADE)
    const schemaSQL = readFileSync(join(__dirname, '..', 'db', 'schema.sql'), 'utf-8');
    await pool.query(schemaSQL);
    console.log('✅ Schema re-created');
  } finally {
    await pool.end();
  }
}

async function main() {
  console.log('\n🔄 AquaSentinel — Full Demo Reset\n');

  await resetNeon();

  // Now run seed scripts via dynamic import
  console.log('\n📡 Running Neon seed...');
  await import('./seed_neon.js');

  console.log('\n🕸️  Running Neo4j seed...');
  await import('./seed_neo4j.js');

  console.log('\n🎯 Demo environment fully reset!\n');
}

main().catch(console.error);
