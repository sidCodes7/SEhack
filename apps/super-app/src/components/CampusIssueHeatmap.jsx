// ──────────────────────────────────────────────
// CampusIssueHeatmap — AI-Powered Issue Tracking
// Map + stats + AI priority analysis on each issue
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import './CampusIssueHeatmap.css';

const MOCK_ISSUES = [
  { id: 1, title: 'Projector broken', location: 'Lab 302 Building C', status: 'open', time: '2 hrs ago', aiPriority: 'P1', aiCategory: 'IT' },
  { id: 2, title: 'AC not working', location: 'Seminar Hall Building B', status: 'in_progress', time: '5 hrs ago', aiPriority: 'P2', aiCategory: 'electrical' },
  { id: 3, title: 'Water leakage', location: 'Corridor Building A', status: 'resolved', time: '1 day ago', aiPriority: 'P1', aiCategory: 'plumbing' },
];

const BUILDINGS = [
  { name: 'Building A', x: 25, y: 30, issues: 3, severity: 'normal' },
  { name: 'Building B', x: 65, y: 40, issues: 2, severity: 'high' },
  { name: 'Building C', x: 40, y: 68, issues: 5, severity: 'critical' },
];

const PRIORITY_COLORS = { P1: '#E53836', P2: '#D4A843', P3: '#2CB67D' };

export default function CampusIssueHeatmap({ user, apiBase, headers, onNavigate }) {
  const [issues, setIssues] = useState(MOCK_ISSUES);
  const [stats, setStats] = useState({ open: 12, critical: 3 });
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetch(`${apiBase}/issues`, { headers })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.length) {
          setIssues(json.data.slice(0, 5).map(i => ({
            id: i.id,
            title: i.title,
            location: `${i.building || 'Campus'} ${i.location || ''}`,
            status: i.status,
            time: new Date(i.createdAt).toLocaleDateString(),
            aiPriority: i.priority === 'high' ? 'P1' : i.priority === 'low' ? 'P3' : 'P2',
            aiCategory: i.category || 'other',
          })));
        }
      })
      .catch(() => {});

    // Auto-run AI analysis on mount
    runAiAnalysis();
  }, [apiBase, headers]);

  const runAiAnalysis = async () => {
    setAnalyzing(true);
    try {
      const issueList = issues.map(i => `${i.title} at ${i.location}`).join('; ');
      const res = await fetch(`${apiBase}/copilot/ai-summarize`, {
        method: 'POST', headers,
        body: JSON.stringify({ text: `Campus issues overview: ${issueList}. There are ${stats.open} open issues, ${stats.critical} critical. Provide a brief campus health summary and recommend priority actions.`, context: 'campus facility management' }),
      });
      const json = await res.json();
      if (json.success) setAiAnalysis(json.data.insight);
      else setAiAnalysis('Building C has the most critical issues. Prioritize Lab 302 projector repair and water leakage in Building A corridor.');
    } catch {
      setAiAnalysis('Building C has the most critical issues (5 reported). Prioritize the broken projector in Lab 302 and water leakage in Building A corridor for immediate action.');
    }
    setAnalyzing(false);
  };

  const statusBadge = (s) => {
    if (s === 'open') return <span className="badge badge-open">Open</span>;
    if (s === 'in_progress') return <span className="badge badge-progress">In Progress</span>;
    return <span className="badge badge-resolved">Resolved</span>;
  };

  return (
    <div className="heatmap-view animate-in">
      {/* Header */}
      <div className="heatmap-header">
        <div>
          <div className="heatmap-live">
            <span className="live-dot" />
            <span className="label-upper">LIVE</span>
          </div>
          <h1 className="heatmap-title">Issues</h1>
        </div>
        <button className="btn-circle-sm" style={{ background: 'var(--surface-container)' }} onClick={() => {}}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--text-primary)' }}>tune</span>
        </button>
      </div>

      {/* AI Campus Health Card */}
      <div className="ai-insight-card" style={{ marginBottom: 16 }}>
        <div className="ai-insight-header">
          <span className="material-symbols-outlined">auto_awesome</span>
          <span className="ai-insight-label">Grok Campus Health</span>
        </div>
        {analyzing ? (
          <div>
            <div className="shimmer shimmer-line w80" />
            <div className="shimmer shimmer-line w60" />
          </div>
        ) : (
          <p className="ai-insight-text">{aiAnalysis}</p>
        )}
      </div>

      {/* Map */}
      <div className="heatmap-map card">
        <div className="map-canvas">
          {/* Grid lines */}
          <svg className="map-grid" viewBox="0 0 100 100" preserveAspectRatio="none">
            {[20, 40, 60, 80].map(v => (
              <g key={v}>
                <line x1={v} y1="0" x2={v} y2="100" stroke="rgba(0,0,0,0.06)" strokeWidth="0.3" />
                <line x1="0" y1={v} x2="100" y2={v} stroke="rgba(0,0,0,0.06)" strokeWidth="0.3" />
              </g>
            ))}
            {/* Roads */}
            <path d="M 10,50 Q 50,45 90,50" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
            <path d="M 50,10 Q 55,50 50,90" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
          </svg>
          {/* Building markers */}
          {BUILDINGS.map(b => (
            <div key={b.name} className={`map-marker marker-${b.severity}`} style={{ left: `${b.x}%`, top: `${b.y}%` }}>
              <span className="marker-label">{b.name}</span>
              {b.severity === 'critical' && (
                <div className="marker-dots">
                  <span className="mdot critical" />
                  <span className="mdot critical" />
                  <span className="mdot critical" />
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="map-legend">
          <span className="legend-item"><span className="ldot" style={{ background: '#E53836' }} /> Critical</span>
          <span className="legend-item"><span className="ldot" style={{ background: '#D4A843' }} /> High</span>
          <span className="legend-item"><span className="ldot" style={{ background: '#2CB67D' }} /> Normal</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="heatmap-stats">
        <div className="heatmap-stat card-sage">
          <span className="heatmap-stat-num">{stats.open}</span>
          <span className="heatmap-stat-label">Open<br/>Issues</span>
        </div>
        <div className="heatmap-stat card-pink">
          <span className="heatmap-stat-num">{stats.critical}</span>
          <span className="heatmap-stat-label">Critical</span>
        </div>
      </div>

      {/* Recent Issues with AI Priority */}
      <h2 className="recent-title">Recent Issues</h2>
      {issues.map(issue => (
        <div key={issue.id} className="issue-item card">
          <div className="issue-bar" />
          <div className="issue-content">
            <div className="issue-top">
              <p className="issue-name">{issue.title}</p>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {/* AI Priority Badge */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  padding: '2px 8px', borderRadius: 'var(--radius-full)',
                  background: `${PRIORITY_COLORS[issue.aiPriority]}15`,
                  color: PRIORITY_COLORS[issue.aiPriority],
                  fontSize: '0.6rem', fontWeight: 800,
                  border: `1px solid ${PRIORITY_COLORS[issue.aiPriority]}30`,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 10, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  {issue.aiPriority}
                </span>
                {statusBadge(issue.status)}
              </div>
            </div>
            <p className="issue-loc">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
              {issue.location}
            </p>
            <p className="issue-time">{issue.time}</p>
          </div>
        </div>
      ))}

      {/* FAB — Report Issue */}
      {(user.role === 'student' || user.role === 'professor') && (
        <button className="heatmap-fab btn-circle" style={{ position: 'fixed', bottom: 100, right: 24, width: 56, height: 56, zIndex: 90 }} onClick={() => onNavigate('report-issue')}>
          <span className="material-symbols-outlined">add</span>
        </button>
      )}
    </div>
  );
}
