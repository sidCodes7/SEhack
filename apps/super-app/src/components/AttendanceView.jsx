// ──────────────────────────────────────────────
// AttendanceView — Attendance Marking + AI Alerts
// Professor marks attendance, AI flags at-risk students
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import './AttendanceView.css';

const MOCK_STUDENTS = [
  { id: '1', name: 'Aisha Sharma', roll: '2021CS01', initials: 'AS', color: '#D8EAE1', status: 'present', pct: 92 },
  { id: '2', name: 'Rahul Joshi', roll: '2021CS02', initials: 'RJ', color: '#F8E4E4', status: 'absent', pct: 68 },
  { id: '3', name: 'Meera Patel', roll: '2021CS03', initials: 'MP', color: '#EAE7F8', status: 'present', pct: 85 },
  { id: '4', name: 'Siddharth Kumar', roll: '2021CS04', initials: 'SK', color: '#F5F0D0', status: 'present', pct: 72 },
  { id: '5', name: 'Neha Kapoor', roll: '2021CS05', initials: 'NK', color: '#D8EAE1', status: 'present', pct: 91 },
];

export default function AttendanceView({ user, apiBase, headers }) {
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [currentClass] = useState({ name: 'Data Structures', section: 'Sem 5 A', time: '10:00 AM' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiAlerts, setAiAlerts] = useState([]);

  const totalStudents = 30;
  const markedCount = students.filter(s => s.status !== null).length;
  const presentCount = students.filter(s => s.status === 'present').length;
  const pct = Math.round((presentCount / students.length) * 100);

  // Generate AI attendance alerts
  useEffect(() => {
    const atRisk = students.filter(s => s.pct < 75);
    if (atRisk.length > 0) {
      setAiAlerts(atRisk.map(s => ({
        name: s.name,
        pct: s.pct,
        risk: s.pct < 70 ? 'critical' : 'warning',
      })));
    }
  }, [students]);

  const toggleStatus = (id, status) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const records = students.map(s => ({ studentId: s.id, status: s.status }));
      await fetch(`${apiBase}/attendance/mark`, {
        method: 'POST', headers,
        body: JSON.stringify({ classId: 'ds-101', date: new Date().toISOString().split('T')[0], records }),
      });
    } catch {}
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="attend-success animate-in">
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--success)' }}>check_circle</span>
        <h2>Attendance Submitted!</h2>
        <p>{presentCount}/{students.length} students present ({pct}%)</p>
        <button className="btn-pill" onClick={() => setSubmitted(false)} style={{ marginTop: 16 }}>Mark Another</button>
      </div>
    );
  }

  return (
    <div className="attend-view animate-in">
      {/* Header */}
      <h1 className="attend-title">Mark<br/>Attendance</h1>

      {/* AI Attendance Alert */}
      {aiAlerts.length > 0 && (
        <div className="ai-insight-card" style={{ marginBottom: 16 }}>
          <div className="ai-insight-header">
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="ai-insight-label">Grok Attendance Alert</span>
          </div>
          {aiAlerts.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem' }}>{a.risk === 'critical' ? '🔴' : '🟡'}</span>
              <p className="ai-insight-text" style={{ margin: 0, fontSize: '0.8rem' }}>
                <strong>{a.name}</strong>: {a.pct}% attendance — {a.risk === 'critical' ? 'at risk of detention' : 'needs improvement'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Current Class info */}
      <div className="attend-class card">
        <div className="class-info">
          <span className="label-upper">Current Class</span>
          <h3 className="class-name">{currentClass.name}</h3>
          <p className="class-detail">{currentClass.section} • {currentClass.time}</p>
        </div>
        <div className="class-actions">
          <button className="class-change-btn">Change</button>
          <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--text-muted)' }}>school</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="attend-progress card-sage">
        <div className="progress-header">
          <span className="progress-count">{markedCount}</span>
          <span className="progress-total">/{totalStudents} marked</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${(markedCount / totalStudents) * 100}%` }} />
        </div>
      </div>

      {/* Student roster */}
      <span className="label-upper" style={{ marginTop: 8 }}>Student Roster</span>
      
      {students.map(student => (
        <div key={student.id} className="roster-item card">
          <div className="roster-avatar" style={{ background: student.color }}>
            <span>{student.initials}</span>
          </div>
          <div className="roster-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <p className="roster-name">{student.name}</p>
              {student.pct < 75 && (
                <span className="ai-badge" style={{ padding: '2px 8px', fontSize: '0.55rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 10 }}>warning</span>
                  {student.pct}%
                </span>
              )}
            </div>
            <p className="roster-roll">Roll: {student.roll}</p>
          </div>
          <div className="roster-btns">
            <button
              className={`toggle-btn toggle-present ${student.status === 'present' ? 'active' : ''}`}
              onClick={() => toggleStatus(student.id, 'present')}
            >Present</button>
            <button
              className={`toggle-btn toggle-absent ${student.status === 'absent' ? 'active' : ''}`}
              onClick={() => toggleStatus(student.id, 'absent')}
            >Absent</button>
          </div>
        </div>
      ))}

      {/* Submit bar */}
      <div className="attend-submit card-sage">
        <div className="submit-info">
          <span className="label-upper">Current Session</span>
          <p className="submit-pct">Attendance: {pct}%</p>
        </div>
        <button className="btn-circle" onClick={handleSubmit} disabled={submitting}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, marginRight: 4 }}>Submit</span>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
