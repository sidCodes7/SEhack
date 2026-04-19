// ──────────────────────────────────────────────
// AdminAuditView — Plugin approval queue (Aether theme)
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import './AdminAuditView.css';

const MOCK_PLUGINS = [
  { id: '1', name: 'Study Buddy', category: 'academic', status: 'pending', developer: 'Rahul J.', securityScore: 'LOW' },
  { id: '2', name: 'Campus Rides', category: 'transport', status: 'pending', developer: 'Meera P.', securityScore: 'MEDIUM' },
  { id: '3', name: 'Canteen Tracker', category: 'food', status: 'approved', developer: 'Priyank M.', securityScore: 'LOW' },
];

export default function AdminAuditView({ apiBase }) {
  const [plugins, setPlugins] = useState(MOCK_PLUGINS);

  useEffect(() => {
    fetch(`${apiBase}/plugins`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.length) {
          setPlugins(json.data.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            status: p.isActive ? 'approved' : 'pending',
            developer: p.developerId || 'Unknown',
            securityScore: 'LOW',
          })));
        }
      })
      .catch(() => {});
  }, [apiBase]);

  const handleAction = async (id, action) => {
    try {
      await fetch(`${apiBase}/plugins/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {}
    setPlugins(prev => prev.map(p =>
      p.id === id ? { ...p, status: action === 'approve' ? 'approved' : 'rejected' } : p
    ));
  };

  return (
    <div className="audit-view animate-in">
      <h1 className="audit-title">Plugin Audit</h1>
      <p className="audit-sub">Review and approve submitted mini-apps</p>

      {plugins.map(plugin => (
        <div key={plugin.id} className="audit-card card">
          <div className="audit-top">
            <div>
              <h3 className="audit-name">{plugin.name}</h3>
              <p className="audit-dev">by {plugin.developer} · {plugin.category}</p>
            </div>
            <span className={`audit-badge ${plugin.status === 'approved' ? 'badge-resolved' : plugin.status === 'rejected' ? 'badge-open' : 'badge-progress'}`}>
              {plugin.status}
            </span>
          </div>

          <div className="audit-security">
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: plugin.securityScore === 'LOW' ? 'var(--success)' : 'var(--gold)' }}>shield</span>
            <span className="audit-score">Security: {plugin.securityScore}</span>
          </div>

          {plugin.status === 'pending' && (
            <div className="audit-actions">
              <button className="btn-pill" style={{ fontSize: '0.75rem', padding: '8px 20px' }} onClick={() => handleAction(plugin.id, 'approve')}>
                Approve
              </button>
              <button className="btn-outline-pill" style={{ fontSize: '0.75rem', padding: '8px 20px', color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => handleAction(plugin.id, 'reject')}>
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
