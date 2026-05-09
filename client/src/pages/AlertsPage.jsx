import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Filter } from 'lucide-react';
import useAlerts from '../hooks/useAlerts';
import { SEVERITY_CONFIG } from '../data/zones';
import '../styles/alerts-page.css';

export default function AlertsPage() {
  const navigate = useNavigate();
  const { alerts, stats, handleFeedback } = useAlerts();
  const [filter, setFilter] = React.useState('all');
  const [expandedId, setExpandedId] = React.useState(null);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  return (
    <div className="page alerts-page">
      <header className="page-header">
        <div className="page-nav">
          <button className="btn btn-back" onClick={() => navigate('/')}>
            <ArrowLeft size={18} /> Dashboard
          </button>
        </div>
        <div className="page-title-row">
          <h1><AlertTriangle size={24} /> Alert Center</h1>
          <p className="text-dim">Real-time anomaly monitoring across all zones</p>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="alerts-stats-bar">
        <div className="stat-chip glass-card">
          <span className="stat-value">{stats?.total || 0}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-chip glass-card critical">
          <span className="stat-value">{alerts.filter(a => a.severity === 'critical').length}</span>
          <span className="stat-label">Critical</span>
        </div>
        <div className="stat-chip glass-card warning">
          <span className="stat-value">{alerts.filter(a => a.severity === 'warning').length}</span>
          <span className="stat-label">Warning</span>
        </div>
        <div className="stat-chip glass-card">
          <span className="stat-value">{stats?.suppressed || 0}</span>
          <span className="stat-label">Suppressed</span>
        </div>
        <div className="stat-chip glass-card accent">
          <span className="stat-value">{stats?.noise_pct || 0}%</span>
          <span className="stat-label">Noise Cut</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="alerts-filter-bar">
        <Filter size={14} />
        {['all', 'critical', 'warning', 'watch', 'normal'].map(f => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
            style={f !== 'all' ? { '--chip-color': SEVERITY_CONFIG[f]?.color } : {}}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alerts Grid */}
      <div className="alerts-grid">
        {filtered.length === 0 && (
          <div className="alerts-empty glass-card">
            <AlertTriangle size={32} />
            <p>No {filter !== 'all' ? filter : ''} alerts found</p>
          </div>
        )}
        {filtered.map((alert) => {
          const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.normal;
          const isExpanded = expandedId === alert.id;
          return (
            <div
              key={alert.id}
              className={`alert-full-card glass-card ${alert.severity}`}
              style={{ '--sev-color': sev.color }}
              onClick={() => setExpandedId(isExpanded ? null : alert.id)}
            >
              <div className="alert-full-top">
                <div className="alert-full-indicator" />
                <div className="alert-full-info">
                  <div className="alert-full-zone">{alert.icon} {alert.zone_name}</div>
                  <div className="alert-full-type">{alert.type?.replace(/_/g, ' ')}</div>
                </div>
                <div className="alert-full-right">
                  <span className={`badge badge-${alert.severity}`}>{alert.severity?.toUpperCase()}</span>
                  <span className="alert-full-score">Score: {alert.score}</span>
                </div>
              </div>
              <div className="alert-full-confidence-row">
                <span>Confidence</span>
                <div className="confidence-bar"><div className="confidence-bar-fill" style={{ width: `${alert.confidence}%` }} /></div>
                <span className="confidence-pct">{alert.confidence}%</span>
              </div>
              {isExpanded && (
                <div className="alert-full-expanded">
                  <p className="alert-full-reasoning">{alert.reasoning}</p>
                  <div className="alert-full-actions">
                    <button className="btn btn-sm btn-valid" onClick={(e) => { e.stopPropagation(); handleFeedback(alert.id, true); }}>
                      ✅ Valid Alert
                    </button>
                    <button className="btn btn-sm btn-invalid" onClick={(e) => { e.stopPropagation(); handleFeedback(alert.id, false); }}>
                      ❌ False Positive
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
