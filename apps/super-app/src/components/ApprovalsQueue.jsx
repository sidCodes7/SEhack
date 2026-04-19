// ──────────────────────────────────────────────
// ApprovalsQueue — Matches approvals_queue wireframe
// Pending badge, request cards with approve/reject
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import './ApprovalsQueue.css';

const MOCK_PENDING = [
  {
    id: '1', type: 'room_booking', requesterName: 'Priyank Mehta', requesterDept: 'B.Tech CSE · Sem 5',
    metadata: { room: 'Room 302', date: '2026-04-19', fromTime: '10:00', toTime: '12:00' },
    currentStage: 1, totalStages: 3,
  },
  {
    id: '2', type: 'leave', requesterName: 'Ananya Shah', requesterDept: 'B.Tech CSE · Sem 3',
    metadata: { date: '2026-04-20', reason: 'Medical' },
    currentStage: 1, totalStages: 3,
  },
];

const TYPE_COLORS = { room_booking: 'lavender', leave: 'cream', certificate: 'pink' };

export default function ApprovalsQueue({ user, apiBase, headers }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBase}/workflow/pending`, { headers })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.length) {
          setPending(json.data.map(r => ({
            ...r,
            requesterName: r.requesterName || 'Student',
            requesterDept: r.requesterDept || 'CSE Dept',
          })));
        } else {
          // No pending or empty — show demo data
          setPending(MOCK_PENDING);
        }
      })
      .catch(() => {
        setPending(MOCK_PENDING);
      })
      .finally(() => setLoading(false));
  }, [apiBase, headers]);

  const handleAction = async (id, action) => {
    setProcessing(id);
    try {
      await fetch(`${apiBase}/workflow/requests/${id}/${action}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ note: notes[id] || '' }),
      });
    } catch {}
    setPending(prev => prev.filter(r => r.id !== id));
    setProcessing(null);
  };

  return (
    <div className="approvals-queue animate-in">
      <div className="aq-header">
        <h1 className="aq-title">Approvals</h1>
        <div className="aq-badge-count">
          <span className="aq-dot" />
          <span>{pending.length} pending</span>
        </div>
      </div>

      {pending.length === 0 && (
        <div className="aq-empty">
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--success)', fontVariationSettings: "'FILL' 1" }}>verified</span>
          <p>All caught up! No pending approvals.</p>
        </div>
      )}

      <div className="aq-grid">
        {pending.map(req => (
          <article key={req.id} className="aq-card card">
            {/* Top: avatar + info + type chip */}
            <div className="aq-card-top">
              <div className="aq-avatar">{req.requesterName?.[0] || 'S'}</div>
              <div className="aq-info">
                <h2 className="aq-name">{req.requesterName}</h2>
                <p className="aq-dept">{req.requesterDept}</p>
              </div>
              <span className={`chip chip-${TYPE_COLORS[req.type] || 'lavender'}`}>
                {(req.type || '').replace('_', ' ')}
              </span>
            </div>

            {/* Detail */}
            <div className="aq-detail">
              <p>{req.metadata?.room || ''} {req.metadata?.date ? `· ${new Date(req.metadata.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}{req.metadata?.fromTime ? `, ${req.metadata.fromTime}` : ''}</p>
            </div>

            {/* Note input */}
            <div className="aq-note-wrap">
              <input
                className="aq-note-input"
                placeholder="Add a note (optional)"
                value={notes[req.id] || ''}
                onChange={e => setNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
              />
            </div>

            {/* Actions */}
            <div className="aq-actions">
              <button className="btn-outline-pill" onClick={() => handleAction(req.id, 'reject')} disabled={processing === req.id}>
                Reject
              </button>
              <button className="btn-pill" onClick={() => handleAction(req.id, 'approve')} disabled={processing === req.id}>
                Approve
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
