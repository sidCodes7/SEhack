import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Square, Radio, Search, Link2, Scale, FileText, Mail, Brain } from 'lucide-react';
import { useSimulationContext } from '../context/SimulationContext';
import { sendDispatchEmail, downloadAlertReport } from '../services/api';
import '../styles/agent-detail.css';

const AGENT_META = {
  ingestion: { name: 'Ingestion Agent', icon: Radio, color: '#00d4aa',
    role: 'Ingests raw satellite & IoT sensor data from 8 coastal zones, normalizes readings, and writes them to the database.' },
  detection: { name: 'Detection Agent', icon: Search, color: '#339af0',
    role: 'Analyzes incoming readings against baseline thresholds. Uses z-score anomaly detection to flag environmental deviations.' },
  correlation: { name: 'Correlation Agent', icon: Link2, color: '#cc5de8',
    role: 'Cross-references detected anomalies across adjacent zones using graph analysis to find correlated environmental events.' },
  triage: { name: 'Triage Agent', icon: Scale, color: '#ff922b',
    role: 'Prioritizes anomalies by severity score, suppresses noise, and escalates critical events. Uncertain cases trigger multi-agent debate.' },
  brief: { name: 'Brief Agent', icon: FileText, color: '#20c997',
    role: 'Generates AI-powered situational intelligence briefings using Grok LLM for each escalated alert.' },
  dispatch: { name: 'Dispatch Agent', icon: Mail, color: '#ff6b6b',
    role: 'Sends critical email notifications and alerts to the marine operations team for immediate action.' },
  learning: { name: 'Learning Agent', icon: Brain, color: '#ffd93d',
    role: 'Processes operator feedback on alerts and adjusts zone sensitivity thresholds to reduce future false positives.' },
};

// ── DEBATE PANEL ──
function DebatePanel({ debate, onResolve }) {
  const [humanChoice, setHumanChoice] = useState(null);
  const [visibleRounds, setVisibleRounds] = useState(0);

  useEffect(() => {
    if (!debate.awaiting_human) return;
    let idx = 0;
    const timer = setInterval(() => {
      idx++;
      setVisibleRounds(idx);
      if (idx >= debate.rounds.length) clearInterval(timer);
    }, 1800);
    return () => clearInterval(timer);
  }, [debate]);

  const handleResolve = (decision) => {
    setHumanChoice(decision);
    onResolve(debate.id, decision);
  };

  const anomaly = debate.anomaly;
  const resolved = !debate.awaiting_human;

  return (
    <div className={`debate-panel glass-card ${resolved ? 'resolved' : 'active'}`}>
      <div className="debate-header">
        <h4>🗣️ Multi-Agent Debate</h4>
        <span className={`badge badge-${anomaly.severity}`}>{anomaly.severity?.toUpperCase()}</span>
      </div>
      <p className="debate-subject">
        <strong>{anomaly.zone_name}</strong> — {anomaly.label} ({anomaly.confidence}% confidence)
      </p>
      <p className="debate-reason text-dim">{debate.triage.reason}</p>

      <div className="debate-rounds">
        {debate.rounds.map((round, i) => (
          <div
            key={i}
            className={`debate-round ${round.bias} ${i < visibleRounds ? 'visible' : 'hidden'}`}
            style={{ '--round-color': round.color }}
          >
            <div className="debate-round-header">
              <span className="debate-agent-icon">{round.icon}</span>
              <span className="debate-agent-name">{round.name}</span>
              <span className={`debate-vote-badge ${round.bias}`}>
                {round.bias === 'escalate' ? '⬆ ESCALATE' : '⬇ SUPPRESS'}
              </span>
            </div>
            <p className="debate-argument">{round.argument}</p>
          </div>
        ))}
      </div>

      {visibleRounds >= debate.rounds.length && (
        <div className="debate-vote-summary">
          <span>Agent Vote: <strong>{debate.vote.escalate}</strong> escalate vs <strong>{debate.vote.suppress}</strong> suppress</span>
          <span className={`debate-verdict ${debate.verdict}`}>
            {debate.verdict === 'deadlocked' ? '⚖️ DEADLOCKED' :
             debate.verdict === 'leaning_escalate' ? '⬆ Leaning Escalate' : '⬇ Leaning Suppress'}
          </span>
        </div>
      )}

      {!resolved && visibleRounds >= debate.rounds.length ? (
        <div className="debate-human-input">
          <p className="debate-prompt">👤 Your decision is needed:</p>
          <div className="debate-actions">
            <button className="btn btn-escalate" onClick={() => handleResolve('escalated')}>
              ⬆ Escalate — Send Alert
            </button>
            <button className="btn btn-suppress" onClick={() => handleResolve('suppressed')}>
              ⬇ Suppress — False Positive
            </button>
          </div>
        </div>
      ) : resolved ? (
        <div className="debate-resolved">
          ✅ Resolved: <strong>{debate.human_decision === 'escalated' ? 'Escalated' : 'Suppressed'}</strong> by operator
        </div>
      ) : null}
    </div>
  );
}

// ── FEED COMPONENTS ──
function IngestionFeed({ log }) {
  return (
    <div className="agent-feed">
      <h3>📡 Live Sensor Ingestion Feed ({log.length} readings)</h3>
      <div className="agent-feed-list">
        {log.length === 0 && <p className="text-dim" style={{ padding: '1rem' }}>Start monitoring to see live data ingestion.</p>}
        {log.map((r, i) => (
          <div key={r.id} className="feed-item glass-card" style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
            <div className="feed-item-header">
              <span className="feed-zone">{r.zone_icon} {r.zone_name}</span>
              <span className="feed-time">{new Date(r.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="feed-source">via {r.source} • {r.quality} quality • {r.latency_ms}ms</div>
            <div className="feed-metrics">
              <span>🌡️ {r.readings.sst}°C</span>
              <span>🦠 {r.readings.chlorophyll}</span>
              <span>💀 {r.readings.dissolved_o2}</span>
              <span>⚗️ {r.readings.ph}</span>
              <span>💧 {r.readings.turbidity}</span>
              <span>🌊 {r.readings.salinity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetectionFeed({ log }) {
  const criticals = log.filter(a => a.severity === 'critical').length;
  const warnings = log.filter(a => a.severity === 'warning').length;
  return (
    <div className="agent-feed">
      <h3>🔍 Anomaly Detection Results ({log.length} detected)</h3>
      <div className="agent-detection-stats">
        <div className="det-stat"><span className="det-num">{log.length}</span><span>Total</span></div>
        <div className="det-stat critical"><span className="det-num">{criticals}</span><span>Critical</span></div>
        <div className="det-stat warning"><span className="det-num">{warnings}</span><span>Warning</span></div>
      </div>
      <div className="agent-feed-list">
        {log.length === 0 && <p className="text-dim" style={{ padding: '1rem' }}>Waiting for ingested data to analyze...</p>}
        {log.map((a, i) => (
          <div key={a.id} className={`feed-item glass-card ${a.severity}`} style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
            <div className="feed-item-header">
              <span className="feed-zone">{a.zone_icon} {a.zone_name}</span>
              <span className={`badge badge-${a.severity}`}>{a.severity?.toUpperCase()}</span>
            </div>
            <div className="feed-item-header" style={{ marginTop: 4 }}>
              <span className="feed-zone" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{a.icon} {a.label}</span>
              <span className="feed-time">{a.confidence}% confidence</span>
            </div>
            <p className="feed-reasoning">{a.reasoning}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CorrelationFeed({ log }) {
  return (
    <div className="agent-feed">
      <h3>🔗 Cross-Zone Correlations ({log.length} found)</h3>
      <div className="agent-feed-list">
        {log.length === 0 && <p className="text-dim" style={{ padding: '1rem' }}>Need 2+ anomalies to find correlations...</p>}
        {log.map((c, i) => (
          <div key={c.id} className="feed-item glass-card corr-card" style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
            <div className="feed-item-header">
              <span className="feed-zone">{c.from_icon} {c.from_name} ↔ {c.to_icon} {c.to_name}</span>
              <span className={`badge ${c.match_pct > 70 ? 'badge-warning' : 'badge-watch'}`}>{c.match_pct}% match</span>
            </div>
            <p className="feed-reasoning">{c.description}</p>

            {/* Mechanism & Lag */}
            <div className="corr-detail-row">
              <div className="corr-detail-item">
                <span className="corr-label">Mechanism</span>
                <span className="corr-value">{c.mechanism}</span>
              </div>
              <div className="corr-detail-item">
                <span className="corr-label">Temporal Lag</span>
                <span className="corr-value">{c.temporal_lag_days} day{c.temporal_lag_days !== 1 ? 's' : ''}</span>
              </div>
              <div className="corr-detail-item">
                <span className="corr-label">Graph Edges</span>
                <span className="corr-value">{c.graph_edges}</span>
              </div>
            </div>

            {/* Shared Metrics */}
            <div className="corr-tags-row">
              <span className="corr-label">Shared Metrics:</span>
              {c.shared_metrics?.map(m => (
                <span key={m} className="corr-tag metric-tag">{m.replace(/_/g, ' ')}</span>
              ))}
            </div>

            {/* Affected Species */}
            <div className="corr-tags-row">
              <span className="corr-label">At-Risk Species:</span>
              {c.affected_species?.map(s => (
                <span key={s} className="corr-tag species-tag">🐟 {s}</span>
              ))}
            </div>

            {/* Confidence Breakdown */}
            {c.confidence_breakdown && (
              <div className="corr-confidence-row">
                <div className="corr-conf-bar">
                  <span className="corr-conf-label">Spatial</span>
                  <div className="corr-bar-track"><div className="corr-bar-fill" style={{ width: `${c.confidence_breakdown.spatial}%`, background: '#339af0' }} /></div>
                  <span className="corr-conf-pct">{c.confidence_breakdown.spatial}%</span>
                </div>
                <div className="corr-conf-bar">
                  <span className="corr-conf-label">Temporal</span>
                  <div className="corr-bar-track"><div className="corr-bar-fill" style={{ width: `${c.confidence_breakdown.temporal}%`, background: '#cc5de8' }} /></div>
                  <span className="corr-conf-pct">{c.confidence_breakdown.temporal}%</span>
                </div>
                <div className="corr-conf-bar">
                  <span className="corr-conf-label">Metric</span>
                  <div className="corr-bar-track"><div className="corr-bar-fill" style={{ width: `${c.confidence_breakdown.metric}%`, background: '#20c997' }} /></div>
                  <span className="corr-conf-pct">{c.confidence_breakdown.metric}%</span>
                </div>
              </div>
            )}

            {/* Insight */}
            <div className="corr-insight">
              <span className="corr-insight-icon">💡</span>
              <span className="corr-insight-text">{c.insight}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TriageFeed({ log, debates, onResolveDebate }) {
  const escalated = log.filter(t => t.decision === 'escalated').length;
  const suppressed = log.filter(t => t.decision === 'suppressed').length;
  const uncertain = log.filter(t => t.decision === 'uncertain').length;
  const noisePct = log.length > 0 ? ((suppressed / log.length) * 100).toFixed(0) : 0;

  return (
    <div className="agent-feed">
      <h3>⚖️ Alert Triage Decisions ({log.length} processed)</h3>
      <div className="agent-detection-stats">
        <div className="det-stat"><span className="det-num">{escalated}</span><span>Escalated</span></div>
        <div className="det-stat"><span className="det-num">{suppressed}</span><span>Suppressed</span></div>
        <div className="det-stat warning"><span className="det-num">{uncertain}</span><span>Uncertain</span></div>
        <div className="det-stat" style={{ color: 'var(--accent-primary)' }}><span className="det-num">{noisePct}%</span><span>Noise Cut</span></div>
      </div>

      {/* Active debates */}
      {debates.filter(d => d.awaiting_human).length > 0 && (
        <div className="debate-section">
          <h4 className="debate-section-title">🗣️ Active Debates — Human Input Required</h4>
          {debates.filter(d => d.awaiting_human).map(d => (
            <DebatePanel key={d.id} debate={d} onResolve={onResolveDebate} />
          ))}
        </div>
      )}

      {/* Resolved debates */}
      {debates.filter(d => !d.awaiting_human).length > 0 && (
        <div className="debate-section resolved-section">
          <h4 className="debate-section-title">✅ Resolved Debates</h4>
          {debates.filter(d => !d.awaiting_human).map(d => (
            <DebatePanel key={d.id} debate={d} onResolve={onResolveDebate} />
          ))}
        </div>
      )}

      <div className="agent-feed-list">
        {log.map((t, i) => (
          <div key={t.id} className={`feed-item glass-card ${t.decision}`} style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
            <div className="feed-item-header">
              <span className="feed-zone">{t.anomaly.zone_icon} {t.anomaly.zone_name}</span>
              <span className={`badge ${t.decision === 'escalated' ? 'badge-critical' : t.decision === 'uncertain' ? 'badge-warning' : 'badge-normal'}`}>
                {t.decision.toUpperCase()}
              </span>
            </div>
            <p className="feed-reasoning">{t.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BriefFeed({ log }) {
  return (
    <div className="agent-feed">
      <h3>📋 Intelligence Briefings ({log.length} generated)</h3>
      <div className="agent-feed-list">
        {log.length === 0 && <p className="text-dim" style={{ padding: '1rem' }}>Waiting for escalated alerts to brief...</p>}
        {log.map((b, i) => (
          <div key={b.id} className="feed-item glass-card" style={{ borderLeftColor: b.severity === 'critical' ? 'var(--severity-critical)' : 'var(--severity-warning)', animationDelay: `${Math.min(i, 5) * 60}ms` }}>
            <div className="feed-item-header">
              <span className="feed-zone">📋 {b.zone_name}</span>
              <span className="feed-time">{b.tokens} tokens • {b.model}</span>
            </div>
            <div className="feed-brief-content">{b.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DispatchFeed({ log, onApprove, onReject }) {
  const [downloadingId, setDownloadingId] = useState(null);
  const pending = log.filter(d => d.status === 'pending_approval');
  const sent = log.filter(d => d.status === 'sent');
  const rejected = log.filter(d => d.status === 'rejected');
  const sending = log.filter(d => d.status === 'sending');
  const failed = log.filter(d => d.status === 'failed');

  const handleDownloadReport = async (dispatch) => {
    setDownloadingId(dispatch.id);
    try {
      await downloadAlertReport(dispatch);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="agent-feed">
      <h3>📧 Email Dispatch Queue ({log.length} total)</h3>
      <div className="agent-detection-stats">
        <div className="det-stat warning"><span className="det-num">{pending.length}</span><span>Pending</span></div>
        <div className="det-stat" style={{color:'var(--accent-primary)'}}><span className="det-num">{sent.length}</span><span>Sent</span></div>
        <div className="det-stat"><span className="det-num">{rejected.length}</span><span>Rejected</span></div>
      </div>

      {/* Pending approval */}
      {pending.length > 0 && (
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--severity-watch)', marginBottom: 'var(--space-md)' }}>⏳ Awaiting Your Approval</h4>
          {pending.map((d, i) => (
            <div key={d.id} className="feed-item glass-card dispatch-pending" style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
              <div className="feed-item-header">
                <span className="feed-zone">✉️ {d.subject}</span>
                <span className={`badge badge-${d.severity}`}>{d.severity?.toUpperCase()}</span>
              </div>
              <p className="feed-reasoning">To: <strong>{d.recipient}</strong></p>
              <p className="feed-reasoning">{d.reasoning?.substring(0, 120)}...</p>
              <div className="dispatch-actions">
                <button className="btn btn-escalate" onClick={() => onApprove(d)}>
                  ✅ Approve & Send Email
                </button>
                <button className="btn btn-suppress" onClick={() => onReject(d.id)}>
                  ❌ Reject
                </button>
                <button
                  className={`btn btn-download-report ${downloadingId === d.id ? 'downloading' : ''}`}
                  onClick={() => handleDownloadReport(d)}
                  disabled={downloadingId === d.id}
                >
                  {downloadingId === d.id ? '⏳ Generating...' : '📄 Download Report'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sending */}
      {sending.map(d => (
        <div key={d.id} className="feed-item glass-card" style={{ borderLeftColor: '#ffd93d' }}>
          <div className="feed-item-header">
            <span className="feed-zone">⏳ Sending: {d.subject}</span>
            <span className="badge badge-watch">SENDING...</span>
          </div>
        </div>
      ))}

      {/* Sent */}
      {sent.length > 0 && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--accent-primary)', marginBottom: 'var(--space-md)' }}>✅ Sent</h4>
          {sent.map(d => (
            <div key={d.id} className="feed-item glass-card" style={{ borderLeftColor: 'var(--accent-primary)', opacity: 0.8 }}>
              <div className="feed-item-header">
                <span className="feed-zone">✉️ {d.subject}</span>
                <span className="badge badge-normal">SENT</span>
              </div>
              <p className="feed-reasoning">To: {d.recipient} • {d.sent_at ? new Date(d.sent_at).toLocaleString() : ''}</p>
            </div>
          ))}
        </div>
      )}

      {log.length === 0 && <p className="text-dim" style={{ padding: '1rem' }}>Only escalated alerts are queued for email dispatch.</p>}
    </div>
  );
}

function LearningFeed({ log }) {
  return (
    <div className="agent-feed">
      <h3>🧠 Sensitivity Updates ({log.length} adjustments)</h3>
      <div className="agent-feed-list">
        {log.length === 0 && <p className="text-dim" style={{ padding: '1rem' }}>Learning agent processes feedback after each cycle.</p>}
        {log.map((l, i) => (
          <div key={l.id} className="feed-item glass-card" style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
            <div className="feed-item-header">
              <span className="feed-zone">{l.zone_name}</span>
              <span className={`badge ${l.direction === 'increased' ? 'badge-warning' : 'badge-normal'}`}>
                {l.old_sensitivity} → {l.new_sensitivity}
              </span>
            </div>
            <p className="feed-reasoning">{l.reason}</p>
            <span className="feed-time">{l.feedback_count} feedback entries processed</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AgentDetailPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const sim = useSimulationContext();
  const meta = AGENT_META[agentId];

  // Handle dispatch email approval — calls backend Nodemailer
  const handleApproveDispatch = useCallback(async (dispatch) => {
    sim.approveDispatch(dispatch.id); // Mark as "sending"
    try {
      const result = await sendDispatchEmail(dispatch);
      sim.markDispatchSent(dispatch.id, !!result?.sent);
      if (result?.previewUrl) {
        console.log('Email preview:', result.previewUrl);
      }
    } catch (err) {
      sim.markDispatchSent(dispatch.id, false);
      console.error('Email dispatch failed:', err);
    }
  }, [sim]);

  if (!meta) {
    return (
      <div className="page agent-detail-page">
        <header className="page-header">
          <button className="btn btn-back" onClick={() => navigate('/agents')}><ArrowLeft size={18} /> Agents</button>
          <h1>Agent not found</h1>
        </header>
      </div>
    );
  }

  const Icon = meta.icon;
  const agentState = sim.agents.find(a => a.id === agentId) || {};

  const feedProps = {
    ingestion: { log: sim.ingestionLog },
    detection: { log: sim.detectionLog },
    correlation: { log: sim.correlationLog },
    triage: { log: sim.triageLog, debates: sim.debates, onResolveDebate: sim.resolveDebate },
    brief: { log: sim.briefLog },
    dispatch: { log: sim.dispatchLog, onApprove: handleApproveDispatch, onReject: sim.rejectDispatch },
    learning: { log: sim.learningLog },
  };

  const FeedComponents = {
    ingestion: IngestionFeed,
    detection: DetectionFeed,
    correlation: CorrelationFeed,
    triage: TriageFeed,
    brief: BriefFeed,
    dispatch: DispatchFeed,
    learning: LearningFeed,
  };

  const Feed = FeedComponents[agentId];

  return (
    <div className="page agent-detail-page">
      <header className="page-header">
        <div className="page-nav">
          <button className="btn btn-back" onClick={() => navigate('/agents')}>
            <ArrowLeft size={18} /> Agents
          </button>
        </div>
        <div className="agent-detail-title">
          <div className="agent-detail-icon" style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}>
            <Icon size={28} color={meta.color} />
          </div>
          <div>
            <h1>{meta.name}</h1>
            <p className="text-dim">{meta.role}</p>
          </div>
          <div className="agent-detail-status-badge">
            <span className={`agent-status-indicator ${agentState.status || 'idle'}`} />
            <span>{agentState.status?.toUpperCase() || 'IDLE'}</span>
            <span className="agent-detail-count">{agentState.processed || 0} processed</span>
          </div>
        </div>
      </header>

      {/* Start/Stop control on detail page too */}
      <div className="agents-control-bar" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="agents-control-left">
          <span className={`agents-status-dot ${sim.isRunning ? 'running' : 'stopped'}`} />
          <span className="agents-status-text">{sim.isRunning ? `Pipeline Active — Cycle ${sim.cycle}` : 'Pipeline Idle'}</span>
        </div>
        <div className="agents-control-right">
          {!sim.isRunning ? (
            <button className="btn btn-primary btn-lg" onClick={() => sim.start(10000)}>
              <Play size={16} /> Start Monitoring
            </button>
          ) : (
            <button className="btn btn-danger btn-lg" onClick={sim.stop}>
              <Square size={16} /> Stop
            </button>
          )}
        </div>
      </div>

      <div className="agent-detail-content">
        {Feed && <Feed {...feedProps[agentId]} />}
      </div>
    </div>
  );
}
