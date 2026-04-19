// ──────────────────────────────────────────────
// MiniAppDashboard — SDK Ecosystem Knowledge Graph
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import './MiniAppDashboard.css';

const CATEGORY_ICONS = {
  utility: 'build', social: 'forum', food: 'restaurant',
  academic: 'menu_book', transport: 'directions_bus', default: 'extension',
};
const CATEGORY_COLORS = {
  food: 'cream', academic: 'lavender', transport: 'sage',
  social: 'pink', utility: 'surface', default: 'surface',
};

export default function MiniAppDashboard({ apiBase, onPluginClick }) {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiBase}/plugins`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data.length) setPlugins(json.data);
        else throw new Error();
      })
      .catch(() => {
        setPlugins([
          { id: '1', name: 'Campus Canteen', slug: 'canteen-tracker', category: 'food', description: 'By SE-A', author: 'SE-A Dept', deploymentUrl: '/aether-bridge-demo.html' },
          { id: '2', name: 'Library Booker', slug: 'library-finder', category: 'academic', description: 'By FE', author: 'FE Students', deploymentUrl: '#' },
          { id: '3', name: 'Bus Tracker', slug: 'bus-tracker', category: 'transport', description: 'By TE-IT', author: 'TE-IT', deploymentUrl: '#' },
          { id: '4', name: 'Lost & Found', slug: 'lost-found', category: 'social', description: 'By CSI Club', author: 'SPIT CSI', deploymentUrl: '#' },
        ]);
      })
      .finally(() => setLoading(false));
  }, [apiBase]);

  if (loading) return <div className="dashboard-loading"><div className="spinner" /></div>;

  return (
    <div className="mini-app-dashboard animate-in">
      <h1 className="mad-title">Aether Ecosystem</h1>
      <p className="mad-subtitle" style={{ marginBottom: 24 }}>Mini-apps built by SPIT developers using our Bridge SDK.</p>

      {/* Visual Component: Knowledge Graph Representation */}
      <div className="ecosystem-graph-card card-surface" style={{ padding: 24, marginBottom: 24, background: '#1A1A1A', borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative' }}>
        <h3 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: 16, zIndex: 2, position: 'relative' }}>SDK Extensibility Graph</h3>
        
        <svg viewBox="0 0 300 150" style={{ width: '100%', height: 180, overflow: 'visible' }}>
          {/* Edges */}
          <path d="M150,75 L50,40" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M150,75 L250,40" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M150,75 L80,130" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M150,75 L220,130" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Animated pulses on edges */}
          <circle cx="150" cy="75" r="3" fill="#D4A843">
            <animate attributeName="cx" values="150;50;150" dur="3s" repeatCount="indefinite" />
            <animate attributeName="cy" values="75;40;75" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="150" cy="75" r="3" fill="#2CB67D">
            <animate attributeName="cx" values="150;250;150" dur="4s" repeatCount="indefinite" />
            <animate attributeName="cy" values="75;40;75" dur="4s" repeatCount="indefinite" />
          </circle>

          {/* Central Node (Host Shell) */}
          <circle cx="150" cy="75" r="24" fill="#2A2A2A" stroke="#4A4A4A" strokeWidth="2" />
          <text x="150" y="79" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">AETHER</text>
          
          {/* Satellite Nodes (Mini Apps) */}
          <circle cx="50" cy="40" r="16" fill="#E53836" fillOpacity="0.8" />
          <text x="50" y="44" fill="#fff" fontSize="12" fontFamily="Material Symbols Outlined" textAnchor="middle">restaurant</text>
          
          <circle cx="250" cy="40" r="16" fill="#6C63FF" fillOpacity="0.8" />
          <text x="250" y="44" fill="#fff" fontSize="12" fontFamily="Material Symbols Outlined" textAnchor="middle">menu_book</text>

          <circle cx="80" cy="130" r="16" fill="#2CB67D" fillOpacity="0.8" />
          <text x="80" y="134" fill="#fff" fontSize="12" fontFamily="Material Symbols Outlined" textAnchor="middle">directions_bus</text>

          <circle cx="220" cy="130" r="16" fill="#D4A843" fillOpacity="0.8" />
          <text x="220" y="134" fill="#fff" fontSize="12" fontFamily="Material Symbols Outlined" textAnchor="middle">forum</text>
        </svg>

        <div style={{ position: 'absolute', bottom: 16, right: 16, fontSize: '0.65rem', color: '#888' }}>Powered by Aether postMessage SDK</div>
      </div>

      <div className="mad-grid">
        {plugins.map(plugin => (
          <button key={plugin.id} className="mad-card card" onClick={() => onPluginClick(plugin)}>
            <div className="mad-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
              <div className={`mad-icon mad-icon-${CATEGORY_COLORS[plugin.category] || CATEGORY_COLORS.default}`}>
                <span className="material-symbols-outlined">
                  {CATEGORY_ICONS[plugin.category] || CATEGORY_ICONS.default}
                </span>
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'var(--surface-container)', padding: '2px 6px', borderRadius: 12, color: 'var(--text-secondary)' }}>
                {plugin.author || 'SPIT Hub'}
              </span>
            </div>
            <div style={{ marginTop: 12, textAlign: 'left', width: '100%' }}>
              <h3 className="mad-name" style={{ fontSize: '1rem', marginBottom: 4 }}>{plugin.name}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{plugin.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
