// ──────────────────────────────────────────────
// MiniAppDashboard — Plugin Grid
// ──────────────────────────────────────────────
// Fetches active plugins and renders icon grid.

import { useState, useEffect } from 'react';
import './MiniAppDashboard.css';

const CATEGORY_ICONS = {
  utility: '🔧',
  social: '💬',
  food: '🍽️',
  academic: '📚',
  finance: '💰',
  health: '🏥',
  transport: '🚌',
  default: '🧩',
};

export default function MiniAppDashboard({ apiBase, onPluginClick }) {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/plugins`);
      const json = await res.json();
      if (json.success) {
        setPlugins(json.data);
      }
    } catch (err) {
      setError('Failed to load apps');
      // Use demo data on failure
      setPlugins([
        { id: '1', name: 'Canteen Tracker', slug: 'canteen-tracker', category: 'food', description: 'Track canteen menu and wait times', deploymentUrl: '/canteen-tracker/index.html', iconUrl: null },
        { id: '2', name: 'Library Finder', slug: 'library-finder', category: 'academic', description: 'Find available seats in the library', deploymentUrl: '#', iconUrl: null },
        { id: '3', name: 'Bus Tracker', slug: 'bus-tracker', category: 'transport', description: 'Real-time campus bus tracking', deploymentUrl: '#', iconUrl: null },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>Loading apps...</p>
      </div>
    );
  }

  return (
    <div className="mini-app-dashboard">
      <div className="dashboard-header">
        <h1>Mini Apps</h1>
        <p className="dashboard-subtitle">Campus tools built by the community</p>
      </div>

      {plugins.length === 0 ? (
        <div className="empty-state">
          <p>🧩</p>
          <p>No apps available yet. Be the first to submit one!</p>
        </div>
      ) : (
        <div className="plugin-grid">
          {plugins.map((plugin) => (
            <button
              key={plugin.id}
              className="plugin-card"
              onClick={() => onPluginClick(plugin)}
            >
              <div className="plugin-icon">
                {plugin.iconUrl ? (
                  <img src={plugin.iconUrl} alt={plugin.name} />
                ) : (
                  <span className="icon-emoji">
                    {CATEGORY_ICONS[plugin.category] || CATEGORY_ICONS.default}
                  </span>
                )}
              </div>
              <span className="plugin-name">{plugin.name}</span>
              <span className="plugin-category">{plugin.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
