// ──────────────────────────────────────────────
// ProfessorDashboard — Matches professor_dashboard wireframe
// Workspace view: Attendance trend, Pending Approvals, Follow-ups, Notices
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import './ProfessorDashboard.css';

const MOCK = {
  attendancePct: 78,
  attendanceLabel: 'CSE Sem 5 · Section A',
  weekBars: [65, 72, 80, 78, 85], // M T W T F
  pendingApprovals: 4,
  followUps: { count: 2, label: 'Students at risk' },
  notices: [
    { id: 1, title: 'Mid-term syllabus updated for CSE-5', time: '2 hrs ago', icon: 'calendar_today' },
    { id: 2, title: 'Reminder: Project submissions due Friday', time: '5 hrs ago', icon: 'description' },
  ],
};

export default function ProfessorDashboard({ user, apiBase, headers, onNavigate }) {
  const [data, setData] = useState(MOCK);

  useEffect(() => {
    fetch(`${apiBase}/dashboard/professor`, { headers })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          const d = json.data;
          setData(prev => ({
            ...prev,
            attendancePct: d.widgets?.attendanceTrend?.currentPercent ?? prev.attendancePct,
            pendingApprovals: d.widgets?.pendingApprovals?.count ?? d.widgets?.pendingApprovals ?? prev.pendingApprovals,
          }));
        }
      })
      .catch(() => {});
  }, [apiBase, headers]);

  return (
    <div className="prof-dash animate-in">
      {/* Greeting */}
      <div className="prof-greeting">
        <p className="prof-greeting-sm">Good morning,</p>
        <h1 className="prof-greeting-name">{user.name}</h1>
      </div>

      {/* Attendance Trend — Sage card */}
      <button className="prof-hero card-sage" onClick={() => onNavigate('attendance')}>
        <div className="prof-hero-top">
          <span className="label-upper">Attendance Trend</span>
          <span className="btn-circle-sm" style={{ width: 32, height: 32, background: '#fff' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--text-primary)' }}>arrow_forward</span>
          </span>
        </div>
        <div className="prof-hero-stat">
          <span className="prof-pct">{data.attendancePct}%</span>
        </div>
        <p className="prof-hero-label">{data.attendanceLabel}</p>
        {/* Bar chart */}
        <div className="prof-bars">
          {['M', 'T', 'W', 'T', 'F'].map((day, i) => (
            <div key={day + i} className="prof-bar-col">
              <div className="prof-bar-bg">
                <div className="prof-bar-fill" style={{ height: `${data.weekBars[i]}%` }} />
              </div>
              <span className="prof-bar-label">{day}</span>
            </div>
          ))}
        </div>
      </button>

      {/* Pending Approvals — Cream card */}
      <button className="prof-stat-card card-cream" onClick={() => onNavigate('approvals')}>
        <div className="stat-top">
          <span className="label-upper" style={{ color: '#7d6b23' }}>Pending Approvals</span>
          <span className="btn-circle-sm" style={{ width: 28, height: 28 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, transform: 'rotate(-45deg)', fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
          </span>
        </div>
        <div className="stat-num">{data.pendingApprovals}</div>
      </button>

      {/* Follow-ups — Pink card */}
      <div className="prof-stat-card card-pink">
        <div className="stat-top">
          <span className="label-upper" style={{ color: '#8e3535' }}>Follow-ups</span>
          <span className="material-symbols-outlined" style={{ color: 'var(--error)', fontSize: 20 }}>priority_high</span>
        </div>
        <div className="stat-num">{data.followUps.count}</div>
        <p className="stat-sub">{data.followUps.label}</p>
      </div>

      {/* Notices */}
      <div className="prof-notices card">
        <div className="notices-header">
          <h3 className="notices-title">Notices</h3>
          <button className="btn-outline-pill" style={{ fontSize: '0.7rem', padding: '6px 14px' }} onClick={() => onNavigate('notices')}>
            + Publish New
          </button>
        </div>
        {data.notices.map(n => (
          <div key={n.id} className="notice-item">
            <div className="notice-icon-wrap">
              <span className="material-symbols-outlined">{n.icon}</span>
            </div>
            <div className="notice-text">
              <p className="notice-title">{n.title}</p>
              <p className="notice-time">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
