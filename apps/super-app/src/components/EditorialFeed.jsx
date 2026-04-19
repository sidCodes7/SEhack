// ──────────────────────────────────────────────
// EditorialFeed — Matches aether_editorial wireframe
// Student-facing read-only notices list
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import './EditorialFeed.css';

const MOCK_NOTICES = [
  { id: '1', title: 'Mini Project Deadline', content: 'Mini Project submission deadline is April 22nd, 11:59 PM. All docs must be uploaded to the portal.', targetRole: 'student', department: 'CSE', createdAt: '2026-04-18T10:00:00Z' },
  { id: '2', title: 'Midterm Schedule Released', content: 'Midterms begin April 28. Seating arrangement will be posted on the notice board.', targetRole: 'student', department: 'CSE', createdAt: '2026-04-15T10:00:00Z' },
  { id: '3', title: 'Lab Session Cancelled — Apr 14', content: 'The machine learning lab on April 14 is cancelled due to faculty unavailability.', targetRole: 'student', department: 'CSE', createdAt: '2026-04-12T10:00:00Z' },
  { id: '4', title: 'Campus WiFi Maintenance', content: 'WiFi will be down Saturday 7 AM – 11 AM for infrastructure upgrade.', targetRole: 'student', createdAt: '2026-04-10T10:00:00Z' },
];

export default function EditorialFeed({ user, apiBase, headers, onBack }) {
  const [notices, setNotices] = useState(MOCK_NOTICES);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch(`${apiBase}/notices`, { headers })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.length) {
          setNotices(json.data);
        }
      })
      .catch(() => {});
  }, [apiBase, headers]);

  return (
    <div className="editorial-feed animate-in">
      <div className="ef-header">
        <button className="ef-back" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="ef-title">Notices</h1>
        <div className="ef-badge">{notices.length}</div>
      </div>

      <div className="ef-list">
        {notices.map(n => (
          <article
            key={n.id}
            className={`ef-card card ${expanded === n.id ? 'ef-expanded' : ''}`}
            onClick={() => setExpanded(expanded === n.id ? null : n.id)}
          >
            <div className="ef-card-header">
              <div className="ef-card-info">
                <h3 className="ef-card-title">{n.title}</h3>
                <span className="ef-card-date">
                  {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {n.department && ` · ${n.department}`}
                </span>
              </div>
              <span className="material-symbols-outlined ef-chevron">{expanded === n.id ? 'expand_less' : 'expand_more'}</span>
            </div>
            {expanded === n.id && (
              <div className="ef-card-body">
                <p>{n.content}</p>
                <div className="ef-copilot-hint">
                  <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1", color: '#D4A843' }}>auto_awesome</span>
                  <span>Ask Copilot about this notice</span>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
