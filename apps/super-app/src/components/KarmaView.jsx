// ──────────────────────────────────────────────
// KarmaView — Matches karma_score_leaderboard wireframe
// Score ring, earning breakdown, top students leaderboard
// ──────────────────────────────────────────────

import { useState, useEffect } from 'react';
import './KarmaView.css';

const MOCK_EARNINGS = [
  { label: 'Issue Reported', points: '+10 pts', color: '#D8EAE1' },
  { label: 'Class Attended', points: '+5 pts', color: '#F5F0D0' },
  { label: 'Class Attended', points: '+5 pts', color: '#F5F0D0' },
  { label: 'Room Returned Early', points: '+15 pts', color: '#D4A843' },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Ananya Shah', points: 312, avatar: '🧑‍💻' },
  { rank: 2, name: 'Rohan Verma', points: 287, avatar: '👨‍🎓' },
  { rank: 3, name: 'Priyank Mehta', points: 240, avatar: '🎓', isUser: true },
];

export default function KarmaView({ user, apiBase, headers }) {
  const [score, setScore] = useState(240);
  const [percentile, setPercentile] = useState(72);
  const [earnings] = useState(MOCK_EARNINGS);
  const [leaderboard] = useState(MOCK_LEADERBOARD);

  useEffect(() => {
    fetch(`${apiBase}/dashboard/student`, { headers })
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.widgets?.karmaScore) {
          setScore(json.data.widgets.karmaScore);
        }
      })
      .catch(() => {});
  }, [apiBase, headers]);

  // SVG ring params
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 400) * circumference; // 400 = max

  return (
    <div className="karma-view animate-in">
      <h1 className="karma-title">Your Karma</h1>

      {/* Score card — Cream */}
      <div className="karma-score-card card-cream">
        <div className="karma-ring-wrap">
          <svg viewBox="0 0 200 200" className="karma-ring-svg">
            <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="12" />
            <circle
              cx="100" cy="100" r={radius}
              fill="none"
              stroke="#D4A843"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference}`}
              transform="rotate(-90 100 100)"
              className="karma-progress-ring"
            />
          </svg>
          <div className="karma-ring-center">
            <span className="karma-ring-score">{score}</span>
            <span className="karma-ring-label">points</span>
          </div>
        </div>
        <p className="karma-percentile">You're more civic than {percentile}% of students</p>
      </div>

      {/* How you earned it */}
      <div className="card">
        <h3 className="karma-section-title">How you earned it</h3>
        {earnings.map((e, i) => (
          <div key={i} className="earning-item">
            <span className="earning-dot" style={{ background: e.color }} />
            <span className="earning-label">{e.label}</span>
            <span className="earning-points" style={{ color: e.color === '#D4A843' ? '#D4A843' : 'var(--text-primary)' }}>{e.points}</span>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="card">
        <h3 className="karma-section-title">Top Students</h3>
        {leaderboard.map(s => (
          <div key={s.rank} className={`lb-item ${s.isUser ? 'lb-user' : ''}`}>
            <span className="lb-rank">{s.rank}</span>
            <span className="lb-avatar">{s.avatar}</span>
            <div className="lb-info">
              <p className="lb-name">{s.name}</p>
            </div>
            <div className="lb-pts">
              <span className={`lb-points ${s.isUser ? 'lb-points-gold' : ''}`}>{s.points}</span>
              <span className="lb-pts-label">pts</span>
            </div>
            <span className="material-symbols-outlined lb-medal" style={{ fontSize: 20, color: s.rank === 1 ? '#D4A843' : 'var(--text-muted)' }}>
              {s.rank <= 2 ? 'military_tech' : 'emoji_events'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
