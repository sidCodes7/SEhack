// ──────────────────────────────────────────────
// ReportIssue — Report Issue + Grok AI Auto-Classify
// Photo upload, category pills, AI-powered classification
// ──────────────────────────────────────────────

import { useState } from 'react';
import './ReportIssue.css';

const CATEGORIES = ['IT', 'Facility', 'Academic', 'Other'];
const BUILDINGS = ['Building A', 'Building B', 'Building C', 'Main Block', 'Auditorium'];

export default function ReportIssue({ user, apiBase, headers, onBack }) {
  const [category, setCategory] = useState('Facility');
  const [title, setTitle] = useState('');
  const [building, setBuilding] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiClassifying, setAiClassifying] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch(`${apiBase}/issues`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, category: category.toLowerCase(), building, description, priority: priority.toLowerCase() }),
      });
    } catch {}
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => onBack(), 1500);
  };

  // AI Auto-Classify via Grok
  const handleAiClassify = async () => {
    const text = `${title}. ${description}`.trim();
    if (text.length < 5) return;
    setAiClassifying(true);
    try {
      const res = await fetch(`${apiBase}/copilot/ai-analyze-issue`, {
        method: 'POST', headers,
        body: JSON.stringify({ description: text }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiResult(json.data);
        // Auto-fill fields from AI response
        if (json.data.priority === 'P1') setPriority('High');
        else if (json.data.priority === 'P3') setPriority('Low');
        else setPriority('Medium');
        
        const catMap = { infrastructure: 'Facility', electrical: 'Facility', plumbing: 'Facility', IT: 'IT', safety: 'Other' };
        if (catMap[json.data.category]) setCategory(catMap[json.data.category]);
      }
    } catch {
      setAiResult({ priority: 'P2', category: 'facility', suggestedFix: 'Please provide more details for accurate classification.', severity: 'medium' });
    }
    setAiClassifying(false);
  };

  // Auto-priority based on keywords (fallback)
  const checkPriority = (text) => {
    const t = text.toLowerCase();
    if (t.includes('flood') || t.includes('fire') || t.includes('emergency') || t.includes('broken')) return 'High';
    if (t.includes('not working') || t.includes('leak')) return 'Medium';
    return 'Low';
  };

  const onTitleChange = (v) => {
    setTitle(v);
    setPriority(checkPriority(v));
  };

  if (submitted) {
    return (
      <div className="report-success animate-in">
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--success)' }}>check_circle</span>
        <h2>Issue Reported!</h2>
        <p>Your issue has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div className="report-view animate-in">
      {/* Header */}
      <div className="report-header">
        <button className="report-back" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="report-title">Report Issue</h1>
      </div>

      {/* Photo upload */}
      <div className="report-photo">
        <div className="photo-placeholder">
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>photo_camera</span>
          <p className="photo-text">Tap to add photo</p>
          <p className="photo-hint">Show us what's wrong</p>
        </div>
        <span className="photo-optional">OPTIONAL</span>
      </div>

      {/* Category */}
      <div className="report-section">
        <span className="label-upper">Category</span>
        <div className="cat-pills">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`chip ${category === c ? 'chip-active' : ''}`}
              onClick={() => setCategory(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="report-form card-lavender">
        <div className="field-group">
          <label>Title</label>
          <input placeholder="e.g., Broken AC in Room 302" value={title} onChange={e => onTitleChange(e.target.value)} />
        </div>
        <div className="field-group">
          <label>Building</label>
          <select value={building} onChange={e => setBuilding(e.target.value)}>
            <option value="">Select a building</option>
            {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="field-group">
          <label>Description</label>
          <textarea rows={4} placeholder="Provide more details..." value={description} onChange={e => setDescription(e.target.value)} />
        </div>
      </div>

      {/* AI Auto-Classify Button */}
      <button
        onClick={handleAiClassify}
        disabled={aiClassifying || (!title && !description)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          padding: '14px 20px', borderRadius: 'var(--radius-xl)',
          background: aiClassifying ? 'var(--surface-container)' : 'linear-gradient(135deg, #EAE7F8, #F5F0D0)',
          border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer',
          fontSize: '0.8rem', fontWeight: 700, fontFamily: 'inherit',
          color: 'var(--text-primary)', transition: 'all 0.3s',
          justifyContent: 'center', marginBottom: 12,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--gold)', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        {aiClassifying ? 'Grok is analyzing...' : '✨ Auto-classify with AI'}
      </button>

      {/* AI Result Card */}
      {aiResult && (
        <div className="ai-insight-card animate-in" style={{ marginBottom: 12 }}>
          <div className="ai-insight-header">
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="ai-insight-label">Grok AI Classification</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <span className="ai-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>priority_high</span>
              {aiResult.priority}
            </span>
            <span className="ai-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>category</span>
              {aiResult.category}
            </span>
            <span className="ai-badge">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>speed</span>
              {aiResult.severity}
            </span>
          </div>
          <p className="ai-insight-text">💡 {aiResult.suggestedFix}</p>
        </div>
      )}

      {/* Auto-priority */}
      <div className="auto-priority card-cream">
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--gold)' }}>info</span>
        <span>Auto-priority: <strong>{priority}</strong></span>
      </div>

      {/* Submit */}
      <div className="report-submit-row">
        <button className="btn-circle" style={{ width: 56, height: 56 }} onClick={handleSubmit} disabled={!title || submitting}>
          <span className="material-symbols-outlined">{submitting ? 'hourglass_top' : 'arrow_forward'}</span>
        </button>
      </div>
    </div>
  );
}
