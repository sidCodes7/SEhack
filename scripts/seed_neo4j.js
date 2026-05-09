// ═══════════════════════════════════════════════════════════════
// AquaSentinel — Seed Neo4j Aura
// Run: node scripts/seed_neo4j.js
// Requires: NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD in .env
// ═══════════════════════════════════════════════════════════════

import 'dotenv/config';
import neo4j from 'neo4j-driver';
import { ZONES } from '../server/src/data/zones.js';

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Adjacency graph from spec
const ADJACENCIES = [
  ['Z1', 'Z5', 2200], ['Z1', 'Z7', 580],
  ['Z2', 'Z4', 350],  ['Z2', 'Z7', 700],
  ['Z3', 'Z4', 1020], ['Z3', 'Z7', 620],
  ['Z4', 'Z7', 400],
  ['Z5', 'Z1', 2200], ['Z5', 'Z8', 1400],
  ['Z6', 'Z5', 1600],
  ['Z7', 'Z1', 580],  ['Z7', 'Z2', 700], ['Z7', 'Z3', 620],
  ['Z8', 'Z5', 1400], ['Z8', 'Z1', 900],
];

const METRICS = [
  { name: 'SST', unit: '°C', description: 'Sea Surface Temperature' },
  { name: 'Chlorophyll', unit: 'mg/m³', description: 'Chlorophyll-a concentration' },
  { name: 'Dissolved O₂', unit: 'mg/L', description: 'Dissolved oxygen level' },
  { name: 'Turbidity', unit: 'NTU', description: 'Water turbidity' },
  { name: 'pH', unit: '', description: 'Ocean pH level' },
  { name: 'Salinity', unit: 'PSU', description: 'Practical Salinity Unit' },
  { name: 'Wind Speed', unit: 'm/s', description: 'Surface wind speed' },
  { name: 'Wave Height', unit: 'm', description: 'Significant wave height' },
];

async function run(cypher, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result;
  } finally {
    await session.close();
  }
}

async function main() {
  console.log('\n🕸️  AquaSentinel — Neo4j Aura Seeder\n');

  try {
    // Test connection
    await run('RETURN 1');
    console.log('📡 Connected to Neo4j Aura\n');

    // Clean slate
    console.log('⏳ Clearing existing data...');
    await run('MATCH (n) DETACH DELETE n');
    console.log('✅ Cleared\n');

    // Create zones
    console.log('⏳ Creating zone nodes...');
    for (const zone of ZONES) {
      await run(
        `CREATE (:Zone {id: $id, name: $name, region: $region, lat: $lat, lng: $lng})`,
        { id: `Z${zone.id}`, name: zone.name, region: zone.region, lat: zone.lat, lng: zone.lng }
      );
    }
    console.log(`✅ Created ${ZONES.length} zone nodes`);

    // Create metrics
    console.log('⏳ Creating metric nodes...');
    for (const m of METRICS) {
      await run(
        'CREATE (:Metric {name: $name, unit: $unit, description: $desc})',
        { name: m.name, unit: m.unit, desc: m.description }
      );
    }
    console.log(`✅ Created ${METRICS.length} metric nodes`);

    // Create adjacencies
    console.log('⏳ Creating adjacency relationships...');
    for (const [from, to, dist] of ADJACENCIES) {
      await run(
        `MATCH (a:Zone {id: $from}), (b:Zone {id: $to})
         CREATE (a)-[:ADJACENT_TO {distance_km: $dist, current_connected: true}]->(b)`,
        { from, to, dist: neo4j.int(dist) }
      );
    }
    console.log(`✅ Created ${ADJACENCIES.length} adjacency edges`);

    // Create constraints
    console.log('⏳ Creating constraints...');
    try { await run('CREATE CONSTRAINT zone_id_unique IF NOT EXISTS FOR (z:Zone) REQUIRE z.id IS UNIQUE'); } catch (e) { /* may exist */ }
    try { await run('CREATE CONSTRAINT event_id_unique IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE'); } catch (e) { /* may exist */ }
    try { await run('CREATE CONSTRAINT metric_name_unique IF NOT EXISTS FOR (m:Metric) REQUIRE m.name IS UNIQUE'); } catch (e) { /* may exist */ }
    console.log('✅ Constraints created\n');

    // Verify
    const nodeCount = await run('MATCH (n) RETURN count(n) AS count');
    const edgeCount = await run('MATCH ()-[r]->() RETURN count(r) AS count');
    console.log(`📊 Verification: ${nodeCount.records[0].get('count')} nodes, ${edgeCount.records[0].get('count')} edges`);

    console.log('\n✅ Neo4j seeding complete!\n');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await driver.close();
  }
}

main();
