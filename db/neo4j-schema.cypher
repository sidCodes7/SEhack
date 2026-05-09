// ═══════════════════════════════════════════════════════════════
// AquaSentinel — Neo4j Aura Graph Schema
// Run against your Neo4j Aura instance via Neo4j Browser
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────
// Clean slate
// ───────────────────────────────────────────
MATCH (n) DETACH DELETE n;

// ───────────────────────────────────────────
// Create Zone nodes (8 monitored zones)
// ───────────────────────────────────────────
CREATE (:Zone {id: 'Z1', name: 'Lakshadweep Coral Reef', region: 'Arabian Sea', lat: 10.57, lng: 72.63});
CREATE (:Zone {id: 'Z2', name: 'Gujarat Mangrove Coast', region: 'Gulf of Khambhat', lat: 21.63, lng: 72.18});
CREATE (:Zone {id: 'Z3', name: 'Kerala Upwelling Zone', region: 'Arabian Sea', lat: 9.93, lng: 76.26});
CREATE (:Zone {id: 'Z4', name: 'Mumbai Offshore', region: 'Arabian Sea', lat: 19.07, lng: 72.87});
CREATE (:Zone {id: 'Z5', name: 'Andaman Reef System', region: 'Bay of Bengal', lat: 11.74, lng: 92.66});
CREATE (:Zone {id: 'Z6', name: 'Sundarbans Delta', region: 'Bay of Bengal', lat: 21.94, lng: 89.18});
CREATE (:Zone {id: 'Z7', name: 'Goa Coastal Strip', region: 'Arabian Sea', lat: 15.49, lng: 73.82});
CREATE (:Zone {id: 'Z8', name: 'Sri Lanka Southern Coast', region: 'Indian Ocean', lat: 6.03, lng: 80.22});

// ───────────────────────────────────────────
// Create Metric nodes (8 tracked metrics)
// ───────────────────────────────────────────
CREATE (:Metric {name: 'SST', unit: '°C', description: 'Sea Surface Temperature'});
CREATE (:Metric {name: 'Chlorophyll', unit: 'mg/m³', description: 'Chlorophyll-a concentration'});
CREATE (:Metric {name: 'Dissolved O₂', unit: 'mg/L', description: 'Dissolved oxygen level'});
CREATE (:Metric {name: 'Turbidity', unit: 'NTU', description: 'Water turbidity'});
CREATE (:Metric {name: 'pH', unit: '', description: 'Ocean pH level'});
CREATE (:Metric {name: 'Salinity', unit: 'PSU', description: 'Practical Salinity Unit'});
CREATE (:Metric {name: 'Wind Speed', unit: 'm/s', description: 'Surface wind speed'});
CREATE (:Metric {name: 'Wave Height', unit: 'm', description: 'Significant wave height'});

// ───────────────────────────────────────────
// Create ADJACENT_TO relationships
// Based on ocean current connectivity and
// ecological corridors
// ───────────────────────────────────────────

// Z1 (Lakshadweep) connections
MATCH (a:Zone {id: 'Z1'}), (b:Zone {id: 'Z5'}) CREATE (a)-[:ADJACENT_TO {distance_km: 2200, current_connected: true}]->(b);
MATCH (a:Zone {id: 'Z1'}), (b:Zone {id: 'Z7'}) CREATE (a)-[:ADJACENT_TO {distance_km: 580, current_connected: true}]->(b);

// Z2 (Gujarat) connections
MATCH (a:Zone {id: 'Z2'}), (b:Zone {id: 'Z4'}) CREATE (a)-[:ADJACENT_TO {distance_km: 350, current_connected: true}]->(b);
MATCH (a:Zone {id: 'Z2'}), (b:Zone {id: 'Z7'}) CREATE (a)-[:ADJACENT_TO {distance_km: 700, current_connected: true}]->(b);

// Z3 (Kerala) connections
MATCH (a:Zone {id: 'Z3'}), (b:Zone {id: 'Z4'}) CREATE (a)-[:ADJACENT_TO {distance_km: 1020, current_connected: true}]->(b);
MATCH (a:Zone {id: 'Z3'}), (b:Zone {id: 'Z7'}) CREATE (a)-[:ADJACENT_TO {distance_km: 620, current_connected: true}]->(b);

// Z4 (Mumbai) connections — reverse edges handled by bidirectionality
MATCH (a:Zone {id: 'Z4'}), (b:Zone {id: 'Z7'}) CREATE (a)-[:ADJACENT_TO {distance_km: 400, current_connected: true}]->(b);

// Z5 (Andaman) connections
MATCH (a:Zone {id: 'Z5'}), (b:Zone {id: 'Z8'}) CREATE (a)-[:ADJACENT_TO {distance_km: 1400, current_connected: true}]->(b);
MATCH (a:Zone {id: 'Z5'}), (b:Zone {id: 'Z1'}) CREATE (a)-[:ADJACENT_TO {distance_km: 2200, current_connected: true}]->(b);

// Z6 (Sundarbans) connections
MATCH (a:Zone {id: 'Z6'}), (b:Zone {id: 'Z5'}) CREATE (a)-[:ADJACENT_TO {distance_km: 1600, current_connected: true}]->(b);

// Z7 (Goa) — already connected above via Z1, Z2, Z3, Z4
// Reverse edges for bidirectional traversal
MATCH (a:Zone {id: 'Z7'}), (b:Zone {id: 'Z1'}) CREATE (a)-[:ADJACENT_TO {distance_km: 580, current_connected: true}]->(b);
MATCH (a:Zone {id: 'Z7'}), (b:Zone {id: 'Z2'}) CREATE (a)-[:ADJACENT_TO {distance_km: 700, current_connected: true}]->(b);
MATCH (a:Zone {id: 'Z7'}), (b:Zone {id: 'Z3'}) CREATE (a)-[:ADJACENT_TO {distance_km: 620, current_connected: true}]->(b);

// Z8 (Sri Lanka) connections
MATCH (a:Zone {id: 'Z8'}), (b:Zone {id: 'Z5'}) CREATE (a)-[:ADJACENT_TO {distance_km: 1400, current_connected: true}]->(b);
MATCH (a:Zone {id: 'Z8'}), (b:Zone {id: 'Z1'}) CREATE (a)-[:ADJACENT_TO {distance_km: 900, current_connected: true}]->(b);

// ───────────────────────────────────────────
// Create constraints and indexes
// ───────────────────────────────────────────
CREATE CONSTRAINT zone_id_unique IF NOT EXISTS FOR (z:Zone) REQUIRE z.id IS UNIQUE;
CREATE CONSTRAINT event_id_unique IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT metric_name_unique IF NOT EXISTS FOR (m:Metric) REQUIRE m.name IS UNIQUE;
CREATE INDEX event_type_index IF NOT EXISTS FOR (e:Event) ON (e.type);
CREATE INDEX event_detected_index IF NOT EXISTS FOR (e:Event) ON (e.detected_at);

// ═══════════════════════════════════════════════════════════════
// Schema complete.
// Nodes: 8 Zones, 8 Metrics
// Relationships: ADJACENT_TO edges per adjacency graph
// Ready for: Event nodes, OCCURRED_IN, TRIGGERED_BY,
//            PRECEDED_BY, CORRELATED_WITH, CAUSED
// ═══════════════════════════════════════════════════════════════
