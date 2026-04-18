// ──────────────────────────────────────────────
// AdminAuditView — Plugin Approval Dashboard
// ──────────────────────────────────────────────
// Lists all plugins (including pending) with their
// Grok audit reports. Admin can approve or reject.

import { useState, useEffect } from 'react';
import './AdminAuditView.css';

export default function AdminAuditView({ apiBase }) {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/plugins`);
      const json = await res.json();
      if (json.success) {
        setPlugins(json.data);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (pluginId, action) => {
    try {
      const res = await fetch(`${apiBase}/plugins/${pluginId}/${action}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.success) {
        fetchAll(); // refresh list
      }
    } catch {
      // handle error
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>Loading audit queue...</p>
      </div>
    );
  }

  return (
    <div className="admin-audit-view">
      <div className="audit-header">
        <h1>Plugin Audit Queue</h1>
        <p className="audit-subtitle">Review and approve submitted mini-apps</p>
      </div>

      {plugins.length === 0 ? (
        <div className="empty-state">
          <p>🛡️</p>
          <p>No plugins to review</p>
        </div>
      ) : (
        <div className="audit-list">
          {plugins.map((plugin) => {
            const audit = plugin.grokAuditReport;
            return (
              <div key={plugin.id} className="audit-card">
                <div className="audit-card-header">
                  <div>
                    <h3>{plugin.name}</h3>
                    <span className="audit-slug">/{plugin.slug}</span>
                  </div>
                  <span className={`status-badge status-${plugin.status}`}>
                    {plugin.status}
                  </span>
                </div>

                <p className="audit-description">{plugin.description}</p>

                <div className="audit-meta">
                  <span>📂 {plugin.category}</span>
                  <span>🔗 {plugin.deploymentUrl}</span>
                </div>

                {audit && (
                  <div className={`audit-report risk-${audit.riskLevel?.toLowerCase()}`}>
                    <div className="report-row">
                      <span>Risk: <strong>{audit.riskLevel}</strong></span>
                      <span>Recommendation: <strong>{audit.recommendation}</strong></span>
                    </div>
                    {audit.findings?.length > 0 && (
                      <ul className="report-findings">
                        {audit.findings.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {plugin.status === 'pending' && (
                  <div className="audit-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => handleAction(plugin.id, 'approve')}
                    >
                      ✅ Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleAction(plugin.id, 'reject')}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
