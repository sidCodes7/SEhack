// ──────────────────────────────────────────────
// PYQView — PYQ Discovery + AI Study Tips + DSpace
// Search, year filter pills, Grok AI tips, DSpace badge
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import './PYQView.css';

const MOCK_PAPERS = [
  { id: 1, subject: 'Data Structures', exam: 'End Sem 2023', dept: 'CSE Dept', pages: 48, format: 'PDF', color: 'lavender', difficulty: 'Hard' },
  { id: 2, subject: 'Database Management', exam: 'Mid Sem 2023', dept: 'CSE Dept', pages: 32, format: 'PDF', color: 'cream', difficulty: 'Medium' },
  { id: 3, subject: 'Operating Systems', exam: 'End Sem 2022', dept: 'CSE Dept', pages: 56, format: 'PDF', color: 'surface', difficulty: 'Hard' },
  { id: 4, subject: 'Computer Networks', exam: 'End Sem 2024', dept: 'CSE Dept', pages: 40, format: 'PDF', color: 'lavender', difficulty: 'Medium' },
  { id: 5, subject: 'Discrete Mathematics', exam: 'Mid Sem 2024', dept: 'CSE Dept', pages: 28, format: 'PDF', color: 'cream', difficulty: 'Easy' },
];

const YEARS = ['All', '2024', '2023', '2022', '2021'];

export default function PYQView({ user, apiBase, headers }) {
  const [papers, setPapers] = useState(MOCK_PAPERS);
  const [search, setSearch] = useState('');
  const [activeYear, setActiveYear] = useState('All');
  const [aiTip, setAiTip] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activePaperId, setActivePaperId] = useState(null);

  useEffect(() => {
    fetch(`${apiBase}/pyq/search?q=&department=CSE`, { headers })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.length) {
          setPapers(json.data.map((p, i) => ({
            id: p.id || i,
            subject: p.title || p.subject,
            exam: p.examType || `End Sem ${p.year || 2024}`,
            dept: p.department || 'CSE Dept',
            pages: p.pages || 30 + Math.floor(Math.random() * 30),
            format: 'PDF',
            color: ['lavender', 'cream', 'surface'][i % 3],
            difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
          })));
        }
      })
      .catch(() => {});
  }, [apiBase, headers]);

  const filtered = papers.filter(p => {
    const matchSearch = !search || p.subject.toLowerCase().includes(search.toLowerCase());
    const matchYear = activeYear === 'All' || p.exam.includes(activeYear);
    return matchSearch && matchYear;
  });

  const getAiStudyTips = async (paper) => {
    setActivePaperId(paper.id);
    setAiLoading(true);
    setAiTip(null);
    try {
      const res = await fetch(`${apiBase}/copilot/ai-summarize`, {
        method: 'POST', headers,
        body: JSON.stringify({ text: `Generate study tips and key topics to focus on for the subject "${paper.subject}" (${paper.exam}). Include 3-4 important topics and one study strategy.`, context: 'study advice' }),
      });
      const json = await res.json();
      if (json.success) setAiTip(json.data.insight);
      else setAiTip('Focus on core concepts, practice previous papers, and review lecture notes.');
    } catch {
      setAiTip('Focus on core concepts, practice previous papers, and review lecture notes. Start with the most weighted topics.');
    }
    setAiLoading(false);
  };

  return (
    <div className="pyq-view animate-in">
      <h1 className="pyq-title">Past<br/>Papers</h1>

      {/* DSpace Integration Card */}
      <div className="dspace-card" style={{ marginBottom: 16 }}>
        <div className="dspace-status">
          <span className="dspace-dot" />
          <span className="dspace-label">DSpace Integration</span>
        </div>
        <p className="dspace-url">📡 dspace.spit.ac.in/xmlui</p>
        <div className="dspace-stats">
          <div>
            <div className="dspace-stat-num">847</div>
            <div className="dspace-stat-label">Papers Indexed</div>
          </div>
          <div>
            <div className="dspace-stat-num">12</div>
            <div className="dspace-stat-label">Departments</div>
          </div>
          <div>
            <div className="dspace-stat-num">2h ago</div>
            <div className="dspace-stat-label">Last Sync</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="pyq-search card">
        <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>search</span>
        <input
          className="pyq-search-input"
          placeholder="Search subject, year..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>mic</span>
      </div>

      {/* Year pills */}
      <div className="pyq-filters no-scrollbar">
        {YEARS.map(y => (
          <button
            key={y}
            className={`chip ${activeYear === y ? 'chip-active' : ''}`}
            onClick={() => setActiveYear(y)}
          >{y}</button>
        ))}
      </div>

      {/* AI Study Tips Card */}
      {(aiTip || aiLoading) && (
        <div className="ai-insight-card animate-in" style={{ marginBottom: 16 }}>
          <div className="ai-insight-header">
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="ai-insight-label">Grok AI Study Tips</span>
          </div>
          {aiLoading ? (
            <div>
              <div className="shimmer shimmer-line w80" />
              <div className="shimmer shimmer-line w60" />
              <div className="shimmer shimmer-line w40" />
            </div>
          ) : (
            <p className="ai-insight-text">{aiTip}</p>
          )}
        </div>
      )}

      {/* Paper cards */}
      {filtered.map(paper => (
        <div key={paper.id} className={`pyq-card pyq-card-${paper.color}`}>
          <div className="pyq-card-content">
            <h2 className="pyq-subject">{paper.subject}</h2>
            <p className="pyq-meta">{paper.exam} · {paper.dept}</p>
            <div className="pyq-badges">
              <span className="chip">{paper.pages} PAGES</span>
              <span className="chip">{paper.format}</span>
              <span className="ai-badge">
                <span className="material-symbols-outlined">speed</span>
                {paper.difficulty}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <button className="pyq-download btn-circle" style={{ width: 44, height: 44 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
            </button>
            <button
              className="pyq-ai-btn"
              onClick={() => getAiStudyTips(paper)}
              disabled={aiLoading}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 2,
                fontSize: '0.65rem', fontWeight: 700, color: 'var(--gold)',
                fontFamily: 'inherit', padding: '4px 0',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1", color: 'var(--gold)' }}>auto_awesome</span>
              Tips
            </button>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="pyq-empty">
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--text-muted)' }}>search_off</span>
          <p>No papers found</p>
        </div>
      )}
    </div>
  );
}
