import neo4j from 'neo4j-driver';

// ───────────────────────────────────────────
// Driver initialization (single instance, reused)
// Graceful if credentials missing
// ───────────────────────────────────────────
let driver;
try {
  if (process.env.NEO4J_URI && process.env.NEO4J_USER) {
    driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
      { maxConnectionPoolSize: 10, connectionAcquisitionTimeout: 30000 }
    );
    driver.verifyConnectivity()
      .then(() => console.log('[neo4j] Connected to Neo4j Aura ✓'))
      .catch((err) => console.error('[neo4j] Connection failed:', err.message));
  } else {
    console.warn('[neo4j] NEO4J_URI/USER not set — running without Neo4j');
  }
} catch (err) {
  console.error('[neo4j] Driver creation failed:', err.message);
}

async function runSession(cypher, params = {}) {
  if (!driver) {
    console.warn('[neo4j] No driver — returning empty result');
    return [];
  }
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((r) => r.toObject());
  } catch (err) {
    console.error(`[neo4j] Query error: ${err.message}`);
    throw err;
  } finally {
    await session.close();
  }
}

export const graph = {
  run: (cypher, params) => runSession(cypher, params),

  getNodes: async (type) => {
    const recs = await runSession(`MATCH (n:${type}) RETURN n`);
    return recs.map((r) => r.n.properties);
  },

  getEdges: async () => {
    return runSession(
      'MATCH (a)-[r]->(b) RETURN a.id AS from, type(r) AS rel, properties(r) AS props, b.id AS to, labels(a)[0] AS fromType, labels(b)[0] AS toType'
    );
  },

  getZoneSubgraph: async (zoneId) => {
    const recs = await runSession(
      'MATCH (z:Zone {id: $id})-[r*1..2]-(c) RETURN z, c, [rel IN r | {type: type(rel), props: properties(rel)}] AS rels',
      { id: zoneId }
    );
    const nodes = new Map();
    const edges = [];
    for (const rec of recs) {
      const z = rec.z.properties;
      const c = rec.c.properties;
      nodes.set(z.id, { ...z, label: 'Zone' });
      nodes.set(c.id || c.name, { ...c, label: rec.c.labels[0] });
      for (const rel of rec.rels) edges.push(rel);
    }
    return { nodes: Array.from(nodes.values()), edges };
  },

  addEvent: async (event) => {
    const recs = await runSession(
      `CREATE (e:Event {id: $id, type: $type, severity: $severity, detected_at: datetime(), confidence: $confidence, zone_id: $zone_id})
       WITH e MATCH (z:Zone {id: $zone_id}) CREATE (e)-[:OCCURRED_IN]->(z)
       WITH e MATCH (m:Metric {name: $metric}) CREATE (e)-[:TRIGGERED_BY]->(m)
       RETURN e`,
      event
    );
    return recs.length > 0 ? recs[0].e.properties : null;
  },

  addCorrelation: async (fromId, toId, type, confidence) => {
    const allowed = ['CORRELATED_WITH', 'PRECEDED_BY', 'CAUSED'];
    const safe = allowed.includes(type) ? type : 'CORRELATED_WITH';
    const recs = await runSession(
      `MATCH (a:Event {id: $from}), (b:Event {id: $to})
       CREATE (a)-[:${safe} {confidence: $conf, created_at: datetime()}]->(b)
       RETURN a, b`,
      { from: fromId, to: toId, conf: confidence }
    );
    return recs.length > 0 ? recs[0] : null;
  },

  getCorrelations: async (hours = 24) => {
    return runSession(
      `MATCH (a:Event)-[r:CORRELATED_WITH|PRECEDED_BY]->(b:Event)
       WHERE a.detected_at > datetime() - duration({hours: $hours})
       RETURN a.id AS from, a.type AS fromType, a.zone_id AS fromZone,
              type(r) AS relType, r.confidence AS confidence,
              b.id AS to, b.type AS toType, b.zone_id AS toZone`,
      { hours: neo4j.int(hours) }
    );
  },

  close: () => driver ? driver.close() : Promise.resolve(),

  healthCheck: async () => {
    try {
      if (!driver) return { connected: false };
      await runSession('RETURN 1');
      return { connected: true };
    } catch {
      return { connected: false };
    }
  },
};

export default graph;
