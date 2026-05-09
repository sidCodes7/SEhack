import React, { useMemo, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import { ArrowLeft, Filter, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useSimulationContext } from '../context/SimulationContext';
import { ZONES } from '../data/zones';
import '../styles/knowledge-graph.css';

// ── Node type config ──
const NODE_CONFIG = {
  zone:        { color: '#339af0', glow: 'rgba(51,154,240,0.4)',  icon: '🌊', size: 14 },
  anomaly:     { color: '#ff3b5c', glow: 'rgba(255,59,92,0.4)',   icon: '⚠️', size: 10 },
  correlation: { color: '#cc5de8', glow: 'rgba(204,93,232,0.4)',  icon: '🔗', size: 9 },
  triage:      { color: '#ff922b', glow: 'rgba(255,146,43,0.4)',  icon: '⚖️', size: 8 },
  brief:       { color: '#20c997', glow: 'rgba(32,201,151,0.4)',  icon: '📋', size: 8 },
  dispatch:    { color: '#ff6b6b', glow: 'rgba(255,107,107,0.4)', icon: '📧', size: 8 },
  debate:      { color: '#ffd93d', glow: 'rgba(255,217,61,0.4)',  icon: '🗣️', size: 9 },
  learning:    { color: '#51cf66', glow: 'rgba(81,207,102,0.4)',  icon: '🧠', size: 8 },
  metric:      { color: '#74c0fc', glow: 'rgba(116,192,252,0.3)', icon: '📊', size: 7 },
};

const EDGE_COLORS = {
  DETECTED_IN:   'rgba(255,59,92,0.25)',
  CORRELATED:    'rgba(204,93,232,0.3)',
  ESCALATED_TO:  'rgba(255,146,43,0.25)',
  BRIEFED:       'rgba(32,201,151,0.25)',
  DISPATCHED:    'rgba(255,107,107,0.25)',
  DEBATED:       'rgba(255,217,61,0.25)',
  LEARNED_FROM:  'rgba(81,207,102,0.25)',
  HAS_METRIC:    'rgba(116,192,252,0.15)',
  FEEDS_INTO:    'rgba(255,255,255,0.08)',
};

function buildGraphData(sim) {
  const nodes = [];
  const links = [];
  const nodeIds = new Set();

  const addNode = (id, label, type, detail = '') => {
    if (nodeIds.has(id)) return;
    nodeIds.add(id);
    nodes.push({ id, label, type, detail });
  };

  const addLink = (source, target, rel) => {
    if (nodeIds.has(source) && nodeIds.has(target)) {
      links.push({ source, target, rel });
    }
  };

  // 1. Zone nodes (always present)
  ZONES.forEach(z => {
    addNode(z.id, z.name, 'zone', `${z.region} — ${z.risk}`);
  });

  // 2. Anomalies from detection log
  sim.detectionLog.slice(0, 30).forEach(a => {
    const nodeId = `anomaly-${a.id}`;
    addNode(nodeId, `${a.icon} ${a.label}`, 'anomaly', `${a.zone_name} — ${a.confidence}% (${a.severity})`);
    addLink(nodeId, `Z${a.zone_id}`, 'DETECTED_IN');
  });

  // 3. Correlations
  sim.correlationLog.slice(0, 15).forEach(c => {
    const nodeId = `corr-${c.id}`;
    addNode(nodeId, `${c.from_name} ↔ ${c.to_name}`, 'correlation', `${c.mechanism} — ${c.match_pct}%`);
    addLink(nodeId, `Z${c.from_zone}`, 'CORRELATED');
    addLink(nodeId, `Z${c.to_zone}`, 'CORRELATED');
    // link to related anomalies
    sim.detectionLog.slice(0, 30).forEach(a => {
      if (a.zone_id === c.from_zone || a.zone_id === c.to_zone) {
        addLink(`anomaly-${a.id}`, nodeId, 'FEEDS_INTO');
      }
    });
  });

  // 4. Triage decisions (escalated/uncertain)
  sim.triageLog.filter(t => t.decision !== 'suppressed').slice(0, 20).forEach(t => {
    const nodeId = `triage-${t.id}`;
    const label = t.decision === 'escalated' ? '🚨 Escalated' : '❓ Uncertain';
    addNode(nodeId, label, 'triage', t.reason?.substring(0, 80));
    addLink(`anomaly-${t.anomaly_id}`, nodeId, 'ESCALATED_TO');
  });

  // 5. Briefs
  sim.briefLog.slice(0, 10).forEach(b => {
    const nodeId = `brief-${b.id}`;
    addNode(nodeId, `📋 Brief: ${b.zone_name}`, 'brief', `${b.tokens} tokens — ${b.model}`);
    // Link brief to its zone
    const zone = ZONES.find(z => z.name === b.zone_name);
    if (zone) addLink(nodeId, zone.id, 'BRIEFED');
  });

  // 6. Dispatches (approved/sent)
  sim.dispatchLog.filter(d => d.status !== 'rejected').slice(0, 10).forEach(d => {
    const nodeId = `dispatch-${d.id}`;
    const statusLabel = d.status === 'sent' ? '✅ Sent' : d.status === 'pending_approval' ? '⏳ Pending' : '📧 Queued';
    addNode(nodeId, `${statusLabel}: ${d.zone_name}`, 'dispatch', `To: ${d.recipient}`);
    const zone = ZONES.find(z => z.name === d.zone_name);
    if (zone) addLink(nodeId, zone.id, 'DISPATCHED');
  });

  // 7. Debates
  sim.debates.slice(0, 8).forEach(db => {
    const nodeId = `debate-${db.id}`;
    const verdict = db.human_decision || db.verdict;
    addNode(nodeId, `🗣️ Debate: ${verdict}`, 'debate', `${db.rounds?.length || 0} agents — ${db.vote?.escalate || 0}/${db.vote?.suppress || 0}`);
    if (db.anomaly?.zone_id) {
      addLink(nodeId, `Z${db.anomaly.zone_id}`, 'DEBATED');
    }
  });

  // 8. Learning updates
  sim.learningLog.slice(0, 10).forEach(l => {
    const nodeId = `learn-${l.id}`;
    addNode(nodeId, `🧠 ${l.direction}: ${l.zone_name}`, 'learning', `${l.old_sensitivity}→${l.new_sensitivity}`);
    const zone = ZONES.find(z => z.name === l.zone_name);
    if (zone) addLink(nodeId, zone.id, 'LEARNED_FROM');
  });

  return { nodes, links };
}

export default function KnowledgeGraphPage() {
  const navigate = useNavigate();
  const sim = useSimulationContext();
  const graphRef = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [filter, setFilter] = useState('all');

  const fullData = useMemo(() => buildGraphData(sim), [
    sim.detectionLog, sim.correlationLog, sim.triageLog,
    sim.briefLog, sim.dispatchLog, sim.debates, sim.learningLog,
  ]);

  const graphData = useMemo(() => {
    if (filter === 'all') return fullData;
    return {
      nodes: fullData.nodes.filter(n => n.type === filter || n.type === 'zone'),
      links: fullData.links.filter(l => {
        const src = typeof l.source === 'object' ? l.source.id : l.source;
        const tgt = typeof l.target === 'object' ? l.target.id : l.target;
        const srcNode = fullData.nodes.find(n => n.id === src);
        const tgtNode = fullData.nodes.find(n => n.id === tgt);
        return (srcNode?.type === filter || srcNode?.type === 'zone') &&
               (tgtNode?.type === filter || tgtNode?.type === 'zone');
      }),
    };
  }, [fullData, filter]);

  const stats = useMemo(() => {
    const counts = {};
    fullData.nodes.forEach(n => { counts[n.type] = (counts[n.type] || 0) + 1; });
    return counts;
  }, [fullData]);

  const paintNode = useCallback((node, ctx, globalScale) => {
    const cfg = NODE_CONFIG[node.type] || NODE_CONFIG.metric;
    const r = cfg.size / (globalScale > 2 ? 1.5 : 1);
    const isHovered = hoveredNode?.id === node.id;

    // Glow
    ctx.save();
    ctx.shadowColor = cfg.glow;
    ctx.shadowBlur = isHovered ? 25 : 12;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = cfg.color;
    ctx.fill();
    ctx.restore();

    // Border ring
    ctx.beginPath();
    ctx.arc(node.x, node.y, r + 1.5, 0, 2 * Math.PI);
    ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = isHovered ? 2 : 0.8;
    ctx.stroke();

    // Label
    const showLabel = globalScale > 0.8 || node.type === 'zone' || isHovered;
    if (showLabel) {
      const fontSize = Math.max(10, 13 / globalScale);
      ctx.font = `${node.type === 'zone' ? '600' : '400'} ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = isHovered ? '#ffffff' : (node.type === 'zone' ? '#e2e8f0' : '#94a3b8');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(node.label, node.x, node.y + r + 4);
    }
  }, [hoveredNode]);

  const paintLink = useCallback((link, ctx) => {
    const color = EDGE_COLORS[link.rel] || 'rgba(255,255,255,0.06)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const src = link.source;
    const tgt = link.target;
    ctx.moveTo(src.x, src.y);
    ctx.lineTo(tgt.x, tgt.y);
    ctx.stroke();
  }, []);

  const handleZoom = (dir) => {
    if (!graphRef.current) return;
    const zoom = graphRef.current.zoom();
    graphRef.current.zoom(dir === 'in' ? zoom * 1.4 : zoom / 1.4, 300);
  };

  const handleFit = () => {
    graphRef.current?.zoomToFit(400, 40);
  };

  const isEmpty = fullData.nodes.length <= 8; // Only zones = no sim data

  return (
    <div className="page knowledge-graph-page" id="knowledge-graph-page">
      {/* Header */}
      <div className="kg-header">
        <div className="kg-header-left">
          <button className="btn btn-back" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Dashboard
          </button>
          <h1 className="kg-title">🔗 Knowledge Graph</h1>
          <p className="kg-subtitle">
            Live entity-relationship graph built from the multi-agent pipeline.
            {fullData.nodes.length} nodes • {fullData.links.length} edges
          </p>
        </div>
        <div className="kg-controls">
          <button className="kg-zoom-btn" onClick={() => handleZoom('in')} title="Zoom In"><ZoomIn size={16} /></button>
          <button className="kg-zoom-btn" onClick={() => handleZoom('out')} title="Zoom Out"><ZoomOut size={16} /></button>
          <button className="kg-zoom-btn" onClick={handleFit} title="Fit All"><Maximize2 size={16} /></button>
        </div>
      </div>

      {/* Filters */}
      <div className="kg-filters">
        <div className="kg-filter-group">
          <Filter size={14} />
          <button className={`kg-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({fullData.nodes.length})
          </button>
          {Object.entries(NODE_CONFIG).map(([type, cfg]) => (
            <button
              key={type}
              className={`kg-filter-btn ${filter === type ? 'active' : ''}`}
              onClick={() => setFilter(type)}
              style={{ '--filter-color': cfg.color }}
            >
              <span className="kg-filter-dot" style={{ background: cfg.color }} />
              {type.charAt(0).toUpperCase() + type.slice(1)} ({stats[type] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="kg-canvas">
        {isEmpty ? (
          <div className="kg-empty">
            <div className="kg-empty-icon">🔗</div>
            <h3>No pipeline data yet</h3>
            <p>Start monitoring on the <strong>Agents</strong> page to populate the knowledge graph with live entity relationships.</p>
            <button className="btn btn-primary" onClick={() => navigate('/agents')}>Go to Agents →</button>
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeCanvasObject={paintNode}
            linkCanvasObject={paintLink}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={1.5}
            linkDirectionalParticleColor={(link) => EDGE_COLORS[link.rel] || 'rgba(0,212,170,0.5)'}
            backgroundColor="transparent"
            enableZoomInteraction={true}
            enablePanInteraction={true}
            cooldownTicks={100}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            onNodeHover={setHoveredNode}
            nodeRelSize={6}
            warmupTicks={50}
          />
        )}
      </div>

      {/* Hover tooltip */}
      {hoveredNode && (
        <div className="kg-tooltip">
          <div className="kg-tooltip-type" style={{ color: NODE_CONFIG[hoveredNode.type]?.color }}>
            {NODE_CONFIG[hoveredNode.type]?.icon} {hoveredNode.type?.toUpperCase()}
          </div>
          <div className="kg-tooltip-label">{hoveredNode.label}</div>
          {hoveredNode.detail && <div className="kg-tooltip-detail">{hoveredNode.detail}</div>}
        </div>
      )}

      {/* Legend */}
      <div className="kg-legend">
        {Object.entries(NODE_CONFIG).map(([type, cfg]) => (
          <div className="kg-legend-item" key={type}>
            <div className="kg-legend-dot" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.glow}` }} />
            <span>{cfg.icon} {type.charAt(0).toUpperCase() + type.slice(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
