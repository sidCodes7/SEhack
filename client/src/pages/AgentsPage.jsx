import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Square, Cpu, Radio, Search, Link2, Scale, FileText, Mail, Brain } from 'lucide-react';
import { useSimulationContext } from '../context/SimulationContext';
import '../styles/agents-page.css';

const AGENT_CARDS = [
  { id: 'ingestion', name: 'Ingestion', icon: Radio, color: '#00d4aa',
    desc: 'Ingests raw satellite & sensor data, normalizes readings, and feeds them to the database.' },
  { id: 'detection', name: 'Detection', icon: Search, color: '#339af0',
    desc: 'Analyzes normalized data to detect anomalies using statistical thresholds and ML models.' },
  { id: 'correlation', name: 'Correlation', icon: Link2, color: '#cc5de8',
    desc: 'Cross-references anomalies across zones to find correlated environmental events.' },
  { id: 'triage', name: 'Triage', icon: Scale, color: '#ff922b',
    desc: 'Prioritizes alerts by severity, suppresses noise, and escalates critical events.' },
  { id: 'brief', name: 'Brief', icon: FileText, color: '#20c997',
    desc: 'Generates AI-powered intelligence briefings for escalated alerts using Grok LLM.' },
  { id: 'dispatch', name: 'Dispatch', icon: Mail, color: '#ff6b6b',
    desc: 'Sends critical email alerts and notifications to the marine operations team.' },
  { id: 'learning', name: 'Learning', icon: Brain, color: '#ffd93d',
    desc: 'Updates zone sensitivity based on operator feedback to reduce false positives over time.' },
];

export default function AgentsPage() {
  const navigate = useNavigate();
  const sim = useSimulationContext();

  const handleStart = () => {
    const speedSelect = document.getElementById('agent-speed-select');
    const interval = speedSelect ? parseInt(speedSelect.value) : 10000;
    sim.start(interval);
  };

  return (
      <div className="page agents-page">
        <header className="page-header">
          <div className="page-nav">
            <button className="btn btn-back" onClick={() => navigate('/')}>
              <ArrowLeft size={18} /> Dashboard
            </button>
          </div>
          <div className="page-title-row">
            <h1><Cpu size={24} /> Agent Pipeline</h1>
            <p className="text-dim">7 AI agents work in sequence: Ingest → Detect → Correlate → Triage → Brief → Dispatch → Learn</p>
          </div>
        </header>

        {/* Control Bar */}
        <div className="agents-control-bar">
          <div className="agents-control-left">
            <span className={`agents-status-dot ${sim.isRunning ? 'running' : 'stopped'}`} />
            <span className="agents-status-text">{sim.isRunning ? 'Pipeline Active' : 'Pipeline Idle'}</span>
            {sim.isRunning && <span className="agents-cycle-badge">Cycle {sim.cycle}</span>}
            {sim.debates.filter(d => d.awaiting_human).length > 0 && (
              <span className="agents-debate-badge">
                🗣️ {sim.debates.filter(d => d.awaiting_human).length} debate(s) need input
              </span>
            )}
          </div>
          <div className="agents-control-right">
            <select className="header-speed-select" id="agent-speed-select" defaultValue="10000">
              <option value="5000">Fast (5s)</option>
              <option value="10000">Normal (10s)</option>
              <option value="20000">Slow (20s)</option>
            </select>
            {!sim.isRunning ? (
              <button className="btn btn-primary btn-lg" onClick={handleStart}>
                <Play size={16} /> Start Monitoring
              </button>
            ) : (
              <button className="btn btn-danger btn-lg" onClick={sim.stop}>
                <Square size={16} /> Stop
              </button>
            )}
          </div>
        </div>

        <div className="agents-main-layout">
          {/* Agent Cards Grid */}
          <div className="agents-grid">
            {AGENT_CARDS.map((agent, idx) => {
              const Icon = agent.icon;
              const agentState = sim.agents.find(a => a.id === agent.id) || {};
              const isActive = agentState.status === 'active';
              const isDone = agentState.status === 'done';
              return (
                <div
                  key={agent.id}
                  className={`agent-card glass-card ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                  style={{ '--agent-color': agent.color, '--agent-index': idx }}
                  onClick={() => navigate(`/agents/${agent.id}`)}
                >
                  <div className="agent-card-header">
                    <div className="agent-card-icon-wrap" style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}30` }}>
                      <Icon size={22} color={agent.color} />
                    </div>
                    <div className="agent-card-status">
                      <span className={`agent-status-indicator ${agentState.status || 'idle'}`} />
                      <span className="agent-status-label">
                        {isActive ? 'ACTIVE' : isDone ? 'DONE' : 'IDLE'}
                      </span>
                    </div>
                  </div>
                  <h3 className="agent-card-name">{agent.name}</h3>
                  <p className="agent-card-desc">{agent.desc}</p>
                  <div className="agent-card-stats">
                    <div className="agent-card-processed">
                      <span className="agent-stat-num">{agentState.processed || 0}</span>
                      <span className="agent-stat-label">processed</span>
                    </div>
                    <span className="agent-card-step">Step {idx + 1}/7</span>
                  </div>
                  {isActive && <div className="agent-card-pulse" style={{ borderColor: agent.color }} />}
                  <div className="agent-card-arrow">→</div>
                </div>
              );
            })}
          </div>

          {/* Live Timeline */}
          <div className="agents-timeline glass-card">
            <h3>📜 Live Pipeline Activity</h3>
            <div className="timeline-scroll">
              {sim.timeline.length === 0 ? (
                <p className="text-dim" style={{ padding: '1rem', textAlign: 'center' }}>
                  Click "Start Monitoring" to see live agent activity
                </p>
              ) : (
                sim.timeline.map(evt => (
                  <div key={evt.id} className="timeline-event" style={{ '--evt-color': evt.color }}>
                    <span className="timeline-icon">{evt.icon}</span>
                    <span className="timeline-text">{evt.text}</span>
                    <span className="timeline-time">{evt.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
