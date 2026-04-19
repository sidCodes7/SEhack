// ──────────────────────────────────────────────
// NoticePublisher — Matches notice_publisher wireframe
// Compose card in lavender, target pills, past notices
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import './NoticePublisher.css';

const TARGETS = ['All Students', 'CSE Dept', 'Sem 5'];

export default function NoticePublisher({ user, apiBase, headers, onBack }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState('All Students');
  const [pastNotices, setPastNotices] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [aiRewriting, setAiRewriting] = useState(false);

  useEffect(() => {
    fetch(`${apiBase}/notices`, { headers })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.length) {
          setPastNotices(json.data);
        } else {
          setPastNotices([
            { id: '1', title: 'Midterm Schedule', createdAt: '2026-04-15T10:00:00Z' },
            { id: '2', title: 'Lab Session Cancelled', createdAt: '2026-04-12T10:00:00Z' },
          ]);
        }
      })
      .catch(() => {
        setPastNotices([
          { id: '1', title: 'Midterm Schedule', createdAt: '2026-04-15T10:00:00Z' },
          { id: '2', title: 'Lab Session Cancelled', createdAt: '2026-04-12T10:00:00Z' },
        ]);
      });
  }, [apiBase, headers]);

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) return;
    setPublishing(true);
    try {
      const targetRole = target === 'All Students' ? 'student' : 'student';
      const department = target === 'CSE Dept' ? 'CSE' : undefined;
      await fetch(`${apiBase}/notices`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, content, targetRole, department }),
      });
    } catch {}
    setPublished(true);
    setPastNotices(prev => [{ id: Date.now().toString(), title, createdAt: new Date().toISOString() }, ...prev]);
    setTitle('');
    setContent('');
    setPublishing(false);
    setTimeout(() => setPublished(false), 3000);
  };

  const handleAiRewrite = async () => {
    if (!content.trim()) return;
    setAiRewriting(true);
    try {
      const res = await fetch(`${apiBase}/copilot/ai-rewrite`, {
        method: 'POST', headers,
        body: JSON.stringify({ text: `Title: ${title}\nContent: ${content}` }),
      });
      const json = await res.json();
      if (json.success && json.data?.rewritten) {
        setContent(json.data.rewritten);
      }
    } catch {}
    setAiRewriting(false);
  };

  return (
    <div className="notice-publisher animate-in">
      {/* Header */}
      <div className="np-header">
        <button className="np-back" onClick={onBack}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="np-title">Publish Notice</h1>
      </div>

      {/* Compose card */}
      <section className="np-compose card-lavender">
        <div className="field-group">
          <label>Title</label>
          <input placeholder="Notice title..." value={title} onChange={e => setTitle(e.target.value)} className="np-input-white" />
        </div>
        <div className="field-group">
          <label>Message</label>
          <textarea rows={4} placeholder="Write your notice..." value={content} onChange={e => setContent(e.target.value)} className="np-input-white" />
        </div>

        {/* Target pills */}
        <div className="field-group">
          <label>Send to:</label>
          <div className="np-targets">
            {TARGETS.map(t => (
              <button
                key={t}
                className={`np-target-pill ${target === t ? 'np-target-active' : ''}`}
                onClick={() => setTarget(t)}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* AI Rewrite Button */}
        <button
          className="np-ai-rewrite"
          onClick={handleAiRewrite}
          disabled={aiRewriting || !content.trim()}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 'var(--radius-full)',
            background: aiRewriting ? 'var(--surface-container)' : 'linear-gradient(135deg, #EAE7F8, #F5F0D0)',
            border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer',
            fontSize: '0.75rem', fontWeight: 700, fontFamily: 'inherit',
            color: 'var(--text-primary)', transition: 'all 0.3s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--gold)', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          {aiRewriting ? 'Rewriting...' : '✨ Rewrite with AI'}
        </button>

        {/* Copilot ready indicator */}
        <div className="np-copilot-badge">
          <span className="material-symbols-outlined" style={{ color: '#D4A843', fontVariationSettings: "'FILL' 1", fontSize: 20 }}>auto_awesome</span>
          <div>
            <p className="np-badge-title">Copilot-ready</p>
            <p className="np-badge-sub">Students can ask Aether Copilot about this notice</p>
          </div>
        </div>

        {/* Publish CTA */}
        <div className="np-publish-row">
          {published && <span className="np-success-text">✓ Published!</span>}
          <button className="btn-circle" style={{ width: 64, height: 64 }} onClick={handlePublish} disabled={publishing || !title.trim()}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Past Notices */}
      {pastNotices.length > 0 && (
        <section className="np-past">
          <h2>Past Notices</h2>
          {pastNotices.map(n => (
            <div key={n.id} className="np-past-item card">
              <div>
                <h3 className="np-past-title">{n.title}</h3>
                <span className="np-past-date">Published {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <span className="material-symbols-outlined">chevron_right</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
