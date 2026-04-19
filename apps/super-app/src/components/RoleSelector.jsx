// ──────────────────────────────────────────────
// RoleSelector — "I am a..." screen
// Matches role_selector wireframe exactly
// ──────────────────────────────────────────────

import { useState } from 'react';
import './RoleSelector.css';

const ROLES = [
  { role: 'student', label: 'Student', subtitle: 'Priyank', icon: 'school', color: 'lavender' },
  { role: 'professor', label: 'Professor', subtitle: 'Harshav', icon: 'menu_book', color: 'cream' },
  { role: 'admin', label: 'Admin / Dean', subtitle: 'Staff Portal', icon: 'grid_view', color: 'sage' },
];

export default function RoleSelector({ onSelect, onBack }) {
  const [selected, setSelected] = useState(null);

  const handleConfirm = () => {
    if (selected) {
      onSelect({ role: selected });
    }
  };

  return (
    <div className="role-page">
      <div className="role-container animate-in">
        <h1 className="role-title">I am a...</h1>

        <div className="role-list">
          {ROLES.map(r => (
            <button
              key={r.role}
              className={`role-card role-card-${r.color} ${selected === r.role ? 'selected' : ''}`}
              onClick={() => setSelected(r.role)}
            >
              <div className="role-info">
                <span className="role-label">{r.label}</span>
                <span className="role-subtitle">{r.subtitle}</span>
              </div>
              <div className="role-icon-circle">
                <span className="material-symbols-outlined">{r.icon}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="role-actions">
          <button className="btn-circle" onClick={handleConfirm} disabled={!selected}>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>

        <button className="role-back" onClick={onBack}>
          ← Back to login
        </button>
      </div>
    </div>
  );
}
