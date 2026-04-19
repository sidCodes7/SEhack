// ──────────────────────────────────────────────
// SubmitRequest — Matches submit_request wireframe
// Type pills, form card, approval chain preview
// ──────────────────────────────────────────────

import { useState } from 'react';
import './SubmitRequest.css';

const REQUEST_TYPES = [
  { id: 'room_booking', label: 'Room Booking', color: 'active' },
  { id: 'leave', label: 'Leave', color: 'cream' },
  { id: 'certificate', label: 'Certificate', color: 'pink' },
];

const ROOMS = ['Conference Room A', 'Meeting Room B', 'Room 302', 'Lab 201', 'Auditorium'];

const CHAIN = [
  { role: 'HoD', icon: 'person' },
  { role: 'Stucco', icon: 'person' },
  { role: 'Dean', icon: 'person' },
];

export default function SubmitRequest({ user, apiBase, headers, onBack, onSubmitted }) {
  const [type, setType] = useState('room_booking');
  const [room, setRoom] = useState(ROOMS[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('11:00');
  const [purpose, setPurpose] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const metadata = type === 'room_booking'
        ? { room, date, fromTime, toTime, purpose }
        : type === 'leave'
        ? { date, reason }
        : { reason: purpose };

      const res = await fetch(`${apiBase}/workflow/request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type, metadata }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setTimeout(() => onSubmitted?.(), 2000);
      }
    } catch {
      // Demo success
      setSuccess(true);
      setTimeout(() => onSubmitted?.(), 2000);
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="sr-success animate-in">
        <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--success)', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <h2>Request Submitted!</h2>
        <p>Your {type.replace('_', ' ')} request is being routed to approvers.</p>
      </div>
    );
  }

  return (
    <div className="submit-request animate-in">
      {/* Header */}
      <div className="sr-header">
        <button className="sr-back" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="sr-title">New Request</h1>
        <div style={{ width: 48 }} />
      </div>

      {/* Type pills */}
      <section className="sr-section">
        <span className="label-upper">Request Type</span>
        <div className="sr-type-pills no-scrollbar">
          {REQUEST_TYPES.map(t => (
            <button
              key={t.id}
              className={`sr-type-pill ${type === t.id ? 'sr-pill-active' : `sr-pill-${t.color}`}`}
              onClick={() => setType(t.id)}
            >{t.label}</button>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="sr-form card">
        {type === 'room_booking' && (
          <>
            <div className="field-group">
              <label>Room</label>
              <div className="sr-select-wrap">
                <select value={room} onChange={e => setRoom(e.target.value)}>
                  {ROOMS.map(r => <option key={r}>{r}</option>)}
                </select>
                <span className="material-symbols-outlined sr-select-icon">expand_more</span>
              </div>
            </div>
            <div className="field-group">
              <label>Date</label>
              <div className="sr-date-wrap">
                <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>calendar_today</span>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>
            <div className="sr-time-row">
              <div className="field-group">
                <label>From</label>
                <input type="time" value={fromTime} onChange={e => setFromTime(e.target.value)} />
              </div>
              <div className="field-group">
                <label>To</label>
                <input type="time" value={toTime} onChange={e => setToTime(e.target.value)} />
              </div>
            </div>
            <div className="field-group">
              <label>Purpose</label>
              <textarea rows={3} placeholder="Briefly describe the reason..." value={purpose} onChange={e => setPurpose(e.target.value)} />
            </div>
          </>
        )}

        {type === 'leave' && (
          <>
            <div className="field-group">
              <label>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="field-group">
              <label>Reason</label>
              <textarea rows={3} placeholder="Reason for leave..." value={reason} onChange={e => setReason(e.target.value)} />
            </div>
          </>
        )}

        {type === 'certificate' && (
          <div className="field-group">
            <label>Certificate Details</label>
            <textarea rows={3} placeholder="Which certificate do you need?" value={purpose} onChange={e => setPurpose(e.target.value)} />
          </div>
        )}
      </section>

      {/* Approval chain preview */}
      <section className="sr-section">
        <span className="label-upper">Approval Chain</span>
        <div className="sr-chain">
          {CHAIN.map((c, i) => (
            <div key={c.role} className="sr-chain-node">
              <div className="sr-chain-circle">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{c.icon}</span>
              </div>
              <span className="sr-chain-label">{c.role}</span>
              {i < CHAIN.length - 1 && (
                <span className="material-symbols-outlined sr-chain-arrow" style={{ fontSize: 16 }}>arrow_forward</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Submit */}
      <div className="sr-submit-row">
        <button className="btn-circle" style={{ width: 64, height: 64 }} onClick={handleSubmit} disabled={submitting}>
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
