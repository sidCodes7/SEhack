import { Router } from 'express';
import { graph } from '../services/neo4jClient.js';
import { validateIdParam } from '../middleware/validation.js';

const router = Router();

// ─── GET /api/graph/nodes ─────────────────────────────────────────────────────
router.get('/nodes', async (req, res, next) => {
  try {
    const { type } = req.query;
    // Just fetch all nodes if no type provided. 
    // Wait, graph.getNodes(type) doesn't work well with undefined, let's pass a generic or handle it
    const nodesType = type || 'Zone|Event|Alert'; // rough mock for 'all'
    let nodes = [];
    if (type) {
      nodes = await graph.getNodes(type);
    } else {
      const z = await graph.getNodes('Zone');
      const e = await graph.getNodes('Event');
      nodes = [...z, ...e];
    }
    
    // Add required D3 attributes
    nodes = nodes.map(n => ({ id: n.id, ...n, label: type || 'Node' }));
    res.json(nodes);
  } catch (err) { next(err); }
});

// ─── GET /api/graph/edges ─────────────────────────────────────────────────────
router.get('/edges', async (_req, res, next) => {
  try {
    const edges = await graph.getEdges();
    // format edges to expected D3 shape: { id, source, target, type }
    const formatted = edges.map((e, idx) => ({
      id: `e${idx}`,
      source: e.from,
      target: e.to,
      type: e.rel,
      properties: e.props
    }));
    res.json(formatted);
  } catch (err) { next(err); }
});

// ─── GET /api/graph/zone/:id/subgraph ────────────────────────────────────────
router.get('/zone/:id/subgraph', validateIdParam, async (req, res, next) => {
  try {
    // In db, IDs are integers, but in Neo4j they might be stored as ints or strings.
    // The synthetic seed stores them as numeric `id: $id`
    const { nodes, edges } = await graph.getZoneSubgraph(parseInt(req.params.id));
    
    // Format edges for D3
    const formattedEdges = edges.map((e, idx) => ({
      id: `e${idx}`,
      source: e.from,
      target: e.to,
      type: e.type,
      properties: e.props
    }));
    
    res.json({ nodes, edges: formattedEdges });
  } catch (err) { next(err); }
});

// ─── GET /api/graph/correlations ─────────────────────────────────────────────
router.get('/correlations', async (req, res, next) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const correlations = await graph.getCorrelations(hours);
    res.json(correlations);
  } catch (err) { next(err); }
});

export default router;
