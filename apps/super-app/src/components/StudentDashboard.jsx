// ──────────────────────────────────────────────
// StudentDashboard — Matches student_dashboard wireframe
// Widget cards: Next Class, Karma, Finance, Pending, Club Alert, Mini Apps
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import './StudentDashboard.css';

const MOCK_DASHBOARD = {
  nextClass: { subject: 'Data Structures', time: '10:30 AM', room: 'Room 302', professor: 'Dr. Harshav' },
  karma: 240,
  financeDue: { amount: 120, label: 'Library fine' },
  pendingRequests: { count: 2, types: ['Room booking', 'Leave'], progress: 1 },
  clubAlert: { title: 'Hackathon meeting', time: 'Today, 4:00 PM · Room 101' },
  miniApps: [
    { id: 'canteen', name: 'Canteen', icon: 'restaurant', color: 'cream', nav: 'apps' },
    { id: 'pyq', name: 'PYQ', icon: 'history_edu', color: 'pink', nav: 'pyq' },
    { id: 'submit-request', name: 'Request', icon: 'edit_square', color: 'lavender', nav: 'submit-request' },
    { id: 'issues', name: 'Issues', icon: 'warning', color: 'sage', nav: 'issues' },
    { id: 'editorial', name: 'Notices', icon: 'campaign', color: 'cream', nav: 'editorial' },
  ],
};

export default function StudentDashboard({ user, apiBase, headers, onNavigate }) {
  const [data, setData] = useState(MOCK_DASHBOARD);

  useEffect(() => {
    // Try to fetch real data
    fetch(`${apiBase}/dashboard/student`, { headers })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          const d = json.data;
          setData(prev => ({
            ...prev,
            karma: d.widgets?.karmaScore ?? prev.karma,
            financeDue: d.widgets?.financeDues?.pending > 0
              ? { amount: d.widgets.financeDues.totalAmount, label: `${d.widgets.financeDues.pending} items` }
              : prev.financeDue,
            pendingRequests: d.widgets?.myRequests?.length > 0
              ? { count: d.widgets.myRequests.length, types: d.widgets.myRequests.map(r => (r.type || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())).slice(0, 2), progress: 1 }
              : prev.pendingRequests,
          }));
        }
      })
      .catch(() => {});
  }, [apiBase, headers]);

  const greeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="student-dash animate-in">
      {/* Greeting */}
      <p className="dash-greeting">{greeting()}, {user.name}</p>

      {/* Next Class — Lavender hero card */}
      <button className="dash-hero card-lavender" onClick={() => onNavigate('calendar')}>
        <div className="hero-top">
          <span className="label-upper">Next class</span>
          <span className="btn-circle-sm">
            <span className="material-symbols-outlined" style={{ fontSize: 16, transform: 'rotate(-45deg)', fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
          </span>
        </div>
        <div className="hero-bottom">
          <h2 className="hero-title">{data.nextClass.subject}</h2>
          <p className="hero-sub">{data.nextClass.time} · {data.nextClass.room} · {data.nextClass.professor}</p>
        </div>
      </button>

      {/* Two-column row: Karma + Finance */}
      <div className="dash-row-2">
        <button className="dash-mini-card card-cream" onClick={() => onNavigate('karma')}>
          <span className="label-upper">Karma Score</span>
          <div className="mini-card-bottom">
            <div className="karma-value">{data.karma} <span className="karma-unit">pts</span></div>
            <svg className="karma-ring" viewBox="0 0 36 36" width="32" height="32">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="4" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#D4A843" strokeWidth="4" strokeDasharray="75, 100" strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
            </svg>
          </div>
        </button>

        <button className="dash-mini-card card-pink" onClick={() => onNavigate('finance')}>
          <div className="mini-card-top">
            <span className="label-upper">Finance Due</span>
            <span className="btn-circle-sm" style={{ width: 28, height: 28 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, transform: 'rotate(-45deg)', fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
            </span>
          </div>
          <div className="finance-bottom">
            <div className="finance-amount">₹{data.financeDue.amount}</div>
            <p className="finance-label">
              {data.financeDue.label}
              <span className="error-dot" />
            </p>
          </div>
        </button>
      </div>

      {/* Pending Requests — White card */}
      <button className="dash-pending card" onClick={() => onNavigate('track-request')}>
        <span className="label-upper">Pending Requests</span>
        <div className="pending-row">
          <div className="pending-count">{data.pendingRequests.count}</div>
          <div className="pending-details">
            <div className="pending-chips">
              {data.pendingRequests.types.map((t, idx) => (
                <span key={idx} className="chip">{t}</span>
              ))}
            </div>
            <div className="progress-segments">
              {[0, 1, 2].map(i => (
                <div key={i} className={`seg ${i < data.pendingRequests.progress ? 'active' : ''}`} />
              ))}
            </div>
          </div>
        </div>
      </button>

      {/* CSI Club Alert — Sage card */}
      <button className="dash-club card-sage" onClick={() => onNavigate('calendar')} style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="club-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '1px', background: 'var(--text-primary)', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>
              SPIT CSI
            </span>
            <span className="label-upper">Club Alert</span>
          </div>
          <span className="btn-circle-sm" style={{ width: 36, height: 36 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, transform: 'rotate(-45deg)', fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
          </span>
        </div>
        <div className="club-bottom">
          <h3 className="club-title">Tech Workshop: AI Agents</h3>
          <p className="club-sub">Today, 4:00 PM · Room 101</p>
        </div>
      </button>

      {/* Mini Apps strip — White card */}
      <div className="dash-miniapps card">
        <span className="label-upper">Mini Apps</span>
        <div className="miniapps-row no-scrollbar">
          {data.miniApps.map(app => (
            <button key={app.id} className="miniapp-item" onClick={() => onNavigate(app.nav || 'apps')}>
              <div className={`miniapp-circle miniapp-${app.color}`}>
                <span className="material-symbols-outlined">{app.icon}</span>
              </div>
              <span className="miniapp-label">{app.name}</span>
            </button>
          ))}
          <button className="miniapp-item" onClick={() => onNavigate('apps')}>
            <div className="miniapp-circle miniapp-more">
              <span className="material-symbols-outlined" style={{ color: 'var(--text-secondary)' }}>add</span>
            </div>
            <span className="miniapp-label" style={{ color: 'var(--text-secondary)' }}>More</span>
          </button>
        </div>
      </div>
    </div>
  );
}
