// ──────────────────────────────────────────────
// AdminDashboard — Matches admin_dashboard_overview wireframe
// ──────────────────────────────────────────────

import './AdminDashboard.css';

const MOCK = {
  bottleneck: { title: 'Bottleneck: Stucco stage', detail: 'Avg 3.2 day delay — 6 requests pending' },
  openIssues: 12,
  pendingApprovals: 9,
  recentActivity: [
    { id: 1, text: 'Material delivery confirmed for Sector B', time: '10 mins ago', color: '#2CB67D' },
    { id: 2, text: 'Safety inspection flagged minor issue on scaffolding', time: '2 hours ago', color: '#D4A843' },
    { id: 3, text: 'Design revision approved by Lead Architect', time: 'Yesterday', color: '#8B6FC0' },
  ],
  quickActions: [
    { label: 'Analytics', icon: 'trending_up' },
    { label: 'Issue Map', icon: 'bookmark' },
    { label: 'Attendance', icon: 'people' },
  ],
};

export default function AdminDashboard({ user, apiBase, headers, onNavigate }) {
  return (
    <div className="admin-dash animate-in">
      <h1 className="admin-title">Dashboard</h1>

      {/* Bottleneck alert — Pink card */}
      <div className="admin-alert card-pink">
        <div className="alert-icon">
          <span className="material-symbols-outlined" style={{ color: 'var(--error)', fontSize: 24, fontVariationSettings: "'FILL' 1" }}>warning</span>
        </div>
        <div className="alert-text">
          <p className="alert-title">{MOCK.bottleneck.title}</p>
          <p className="alert-detail">{MOCK.bottleneck.detail}</p>
        </div>
        <button className="btn-pill" style={{ fontSize: '0.75rem', padding: '8px 16px' }}>Nudge</button>
      </div>

      {/* Open Issues — Sage card */}
      <button className="admin-stat card-sage" onClick={() => onNavigate('issues')}>
        <span className="label-upper">Open Issues</span>
        <div className="admin-stat-row">
          <span className="admin-stat-num">{MOCK.openIssues}</span>
          <span className="btn-circle-sm">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </span>
        </div>
      </button>

      {/* Pending Approvals — Cream card */}
      <button className="admin-stat card-cream" onClick={() => onNavigate('plugins')}>
        <span className="label-upper">Pending Approvals</span>
        <div className="admin-stat-row">
          <span className="admin-stat-num">{MOCK.pendingApprovals}</span>
          <span className="btn-circle-sm">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </span>
        </div>
      </button>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="section-title">Recent Activity</h3>
        {MOCK.recentActivity.map(a => (
          <div key={a.id} className="activity-item">
            <span className="activity-dot" style={{ background: a.color }} />
            <div className="activity-text">
              <p className="activity-desc">{a.text}</p>
              <p className="activity-time">{a.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions — Sage card */}
      <div className="card-sage quick-actions-card">
        <h3 className="section-title">Quick Actions</h3>
        {MOCK.quickActions.map(a => (
          <button
            key={a.label}
            className="quick-action-row"
            onClick={() => {
              if (a.label === 'Issue Map') onNavigate('issues');
              if (a.label === 'Attendance') onNavigate('attendance');
            }}
          >
            <span>{a.label}</span>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{a.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
