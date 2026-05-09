import React, { useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { MOCK_GRAPH_NODES, MOCK_GRAPH_EDGES } from '../../data/mockData';
import '../../styles/graph.css';

const NODE_COLORS = {
  zone: '#3b82f6',
  event: '#ff3b5c',
  metric: '#51cf66',
  alert: '#ff9f43',
};

export default function GraphPanel({ onClose }) {
  const graphRef = useRef();

  const graphData = {
    nodes: MOCK_GRAPH_NODES.map(n => ({ ...n, val: n.type === 'zone' ? 5 : 3 })),
    links: MOCK_GRAPH_EDGES.map(e => ({ ...e })),
  };

  const paintNode = useCallback((node, ctx, globalScale) => {
    const size = node.type === 'zone' ? 8 : 6;
    const color = NODE_COLORS[node.type] || '#94a3b8';
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    // glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    // label
    if (globalScale > 1.5) {
      ctx.font = `${10 / globalScale}px Inter, sans-serif`;
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + size + 8 / globalScale);
    }
  }, []);

  return (
    <div className="graph-overlay" id="graph-panel">
      <div className="graph-header">
        <span className="graph-title">🔗 Knowledge Graph</span>
        <button className="graph-close" onClick={onClose}>✕ Close</button>
      </div>
      <div className="graph-body">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeCanvasObject={paintNode}
          linkColor={() => 'rgba(255,255,255,0.1)'}
          linkWidth={1.5}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => '#00d4aa'}
          backgroundColor="transparent"
          enableZoomInteraction={true}
          enablePanInteraction={true}
        />
      </div>
      <div className="graph-legend">
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <div className="graph-legend-item" key={type}>
            <div className="graph-legend-dot" style={{ background: color }} />
            <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
