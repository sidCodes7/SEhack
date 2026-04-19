// ──────────────────────────────────────────────
// TrackRequest — Matches track_request wireframe
// Horizontal status tracker, detail card, approver notes
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import './TrackRequest.css';

const MOCK_REQUESTS = [
  {
    id: '1', type: 'room_booking', status: 'pending', currentStage: 2, totalStages: 3,
    metadata: { room: 'Room 302', date: '2026-04-19', fromTime: '10:00', toTime: '12:00', purpose: 'Weekly AI Research Group Meeting & Presentation Rehearsal.' },
    stages: [
      { stageNumber: 1, approverRole: 'HoD', status: 'approved', note: 'Approved. Please ensure the projector is turned off after use.', decidedAt: '2026-04-18T14:15:00Z' },
      { stageNumber: 2, approverRole: 'Stucco', status: 'pending', note: null, decidedAt: null },
      { stageNumber: 3, approverRole: 'Dean', status: 'pending', note: null, decidedAt: null },
    ],
    createdAt: '2026-04-18T10:00:00Z',
  },
];

export default function TrackRequest({ user, apiBase, headers, onBack }) {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${apiBase}/workflow/requests`, { headers })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.length) {
          setRequests(json.data);
        }
      })
      .catch(() => {});
  }, [apiBase, headers]);

  const req = selected || requests[0];
  if (!req) {
    return (
      <div className="tr-empty animate-in">
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--text-muted)' }}>inbox</span>
        <p>No requests yet</p>
        <button className="btn-pill" onClick={onBack}>Submit one</button>
      </div>
    );
  }

  const meta = req.metadata || {};
  const stages = req.stages || [];

  return (
    <div className="track-request animate-in">
      {/* Header */}
      <div className="tr-header">
        <button className="tr-back" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="tr-title">{(req.type || '').replace('_', ' ')}</h1>
          <p className="tr-sub">Submitted {new Date(req.createdAt).toLocaleDateString()} · {meta.room || ''}</p>
        </div>
      </div>

      {/* Status tracker */}
      <section className="tr-tracker card">
        <div className="tr-tracker-head">
          <h2>Request Status</h2>
          <span className={`badge ${req.status === 'approved' ? 'badge-resolved' : req.status === 'rejected' ? 'badge-open' : 'badge-progress'}`}>
            {req.status === 'pending' ? 'In Progress' : req.status}
          </span>
        </div>
        <div className="tr-stages">
          {/* Connector line */}
          <div className="tr-connector-bg" />
          <div className="tr-connector-fill" style={{ width: `${((req.currentStage - 1) / (req.totalStages - 1)) * 100}%` }} />
          
          {stages.map((stage, i) => (
            <div key={i} className="tr-stage">
              <div className={`tr-stage-circle ${stage.status === 'approved' ? 'tr-done' : stage.stageNumber === req.currentStage ? 'tr-active' : 'tr-waiting'}`}>
                {stage.status === 'approved' ? (
                  <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                ) : stage.stageNumber === req.currentStage ? (
                  <div className="tr-pulse" />
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>radio_button_unchecked</span>
                )}
              </div>
              <p className="tr-stage-role">{stage.approverRole}</p>
              <p className="tr-stage-status">{stage.status === 'approved' ? 'Approved' : stage.stageNumber === req.currentStage ? 'Pending' : 'Waiting'}</p>
              {stage.decidedAt && <p className="tr-stage-date">{new Date(stage.decidedAt).toLocaleDateString()}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Detail card */}
      <section className="tr-detail card-lavender">
        <div className="tr-detail-top">
          <div>
            <h3 className="tr-detail-title">{meta.room || req.type} · {user.department || 'CSE'} Dept</h3>
            <p className="tr-detail-sub">{meta.date ? new Date(meta.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}{meta.fromTime ? `, ${meta.fromTime} – ${meta.toTime}` : ''}</p>
          </div>
          <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>meeting_room</span>
        </div>
        {meta.purpose && (
          <div className="tr-purpose">
            <span className="label-upper">Purpose</span>
            <p>{meta.purpose}</p>
          </div>
        )}
      </section>

      {/* Approver notes */}
      {stages.filter(s => s.note).map((stage, i) => (
        <section key={i} className="tr-note card-cream">
          <div className="tr-note-header">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit_note</span>
            <span className="label-upper" style={{ fontSize: '0.7rem' }}>{stage.approverRole} Note</span>
          </div>
          <p className="tr-note-text">"{stage.note}"</p>
          {stage.decidedAt && (
            <div className="tr-note-author">
              <div className="tr-note-avatar">{stage.approverRole[0]}</div>
              <span className="tr-note-date">{stage.approverRole} · {new Date(stage.decidedAt).toLocaleString()}</span>
            </div>
          )}
        </section>
      ))}

      {/* Cancel */}
      {req.status === 'pending' && (
        <div className="tr-cancel">
          <button className="tr-cancel-btn">Cancel this request</button>
        </div>
      )}

      {/* Other requests */}
      {requests.length > 1 && (
        <section className="tr-others">
          <span className="label-upper">Other Requests</span>
          {requests.filter(r => r.id !== req.id).map(r => (
            <button key={r.id} className="tr-other-item card" onClick={() => setSelected(r)}>
              <span className="tr-other-type">{(r.type || '').replace('_', ' ')}</span>
              <span className={`badge ${r.status === 'approved' ? 'badge-resolved' : 'badge-progress'}`}>{r.status}</span>
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
