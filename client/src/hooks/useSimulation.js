// ═══════════════════════════════════════════════════════════════
// AquaSentinel — Client-Side Simulation Engine
// Orchestrates all 7 agents in sequence with realistic timing
// Persists state to localStorage so refresh doesn't lose data
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  generateIngestionEvent,
  generateDetectionEvent,
  generateCorrelationEvent,
  generateTriageDecision,
  generateDebate,
  generateBrief,
  generateDispatch,
  generateLearningUpdate,
} from '../data/simulationData';

const AGENT_ORDER = ['ingestion', 'detection', 'correlation', 'triage', 'brief', 'dispatch', 'learning'];
const STORAGE_KEY = 'aquasentinel_simulation';

// ── Load persisted state ──
function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export default function useSimulation() {
  const persisted = loadPersistedState();

  const [isRunning, setIsRunning] = useState(false);
  const [cycle, setCycle] = useState(persisted?.cycle || 0);
  const [speed, setSpeed] = useState(10000);

  // Agent states
  const [agents, setAgents] = useState(
    persisted?.agents || AGENT_ORDER.map(id => ({ id, status: 'idle', processed: 0, lastEvent: null }))
  );

  // Event logs per agent
  const [ingestionLog, setIngestionLog] = useState(persisted?.ingestionLog || []);
  const [detectionLog, setDetectionLog] = useState(persisted?.detectionLog || []);
  const [correlationLog, setCorrelationLog] = useState(persisted?.correlationLog || []);
  const [triageLog, setTriageLog] = useState(persisted?.triageLog || []);
  const [briefLog, setBriefLog] = useState(persisted?.briefLog || []);
  const [dispatchLog, setDispatchLog] = useState(persisted?.dispatchLog || []);
  const [learningLog, setLearningLog] = useState(persisted?.learningLog || []);

  // Debate queue
  const [debates, setDebates] = useState(persisted?.debates || []);

  // Critical alerts for map markers
  const [criticalAlerts, setCriticalAlerts] = useState(persisted?.criticalAlerts || []);

  // Global timeline
  const [timeline, setTimeline] = useState(persisted?.timeline || []);

  // Refs for cleanup
  const timersRef = useRef([]);
  const runningRef = useRef(false);

  // ── Persist state on every change ──
  useEffect(() => {
    const state = {
      cycle, agents: agents.map(a => ({ ...a, status: 'idle' })),
      ingestionLog, detectionLog, correlationLog, triageLog,
      briefLog, dispatchLog, learningLog,
      debates, criticalAlerts, timeline,
    };
    saveState(state);
  }, [cycle, agents, ingestionLog, detectionLog, correlationLog, triageLog,
      briefLog, dispatchLog, learningLog, debates, criticalAlerts, timeline]);

  const addTimeline = useCallback((icon, color, text) => {
    setTimeline(prev => [{
      id: Date.now() + Math.random(),
      icon, color, text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }, ...prev].slice(0, 50));
  }, []);

  const updateAgent = useCallback((id, updates) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  // ── Run one full pipeline cycle ──
  const runCycle = useCallback(async (cycleNum) => {
    if (!runningRef.current) return;

    const delay = (ms) => new Promise(r => {
      const t = setTimeout(r, ms);
      timersRef.current.push(t);
    });

    const baseDelay = speed / 7;

    // ─────── STEP 1: INGESTION ───────
    updateAgent('ingestion', { status: 'active' });
    addTimeline('📡', '#00d4aa', `Cycle ${cycleNum}: Ingestion agent activated`);

    const ingested = [];
    const zonesToIngest = [1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 5));
    for (const zid of zonesToIngest) {
      if (!runningRef.current) return;
      const evt = generateIngestionEvent(zid);
      ingested.push(evt);
      setIngestionLog(prev => [evt, ...prev].slice(0, 100));
      addTimeline('📡', '#00d4aa', `Ingested ${evt.zone_name} via ${evt.source}`);
      await delay(300 + Math.random() * 500);
    }
    updateAgent('ingestion', { status: 'done' });
    setAgents(prev => prev.map(a => a.id === 'ingestion' ? { ...a, processed: a.processed + ingested.length } : a));

    await delay(baseDelay * 0.3);
    if (!runningRef.current) return;

    // ─────── STEP 2: DETECTION ───────
    updateAgent('detection', { status: 'active' });
    addTimeline('🔍', '#339af0', 'Detection agent scanning ingested data...');

    const detected = [];
    const detectCount = Math.min(ingested.length, 2 + Math.floor(Math.random() * 3));
    for (let i = 0; i < detectCount; i++) {
      if (!runningRef.current) return;
      const anomaly = generateDetectionEvent(ingested[i]);
      detected.push(anomaly);
      setDetectionLog(prev => [anomaly, ...prev].slice(0, 100));
      addTimeline(anomaly.icon, anomaly.severity === 'critical' ? '#ff3b5c' : '#ff9f43',
        `${anomaly.label} detected in ${anomaly.zone_name} (${anomaly.confidence}%)`);
      await delay(500 + Math.random() * 800);
    }
    setAgents(prev => prev.map(a => a.id === 'detection' ? { ...a, status: 'done', processed: a.processed + detected.length } : a));

    await delay(baseDelay * 0.3);
    if (!runningRef.current) return;

    // ─────── STEP 3: CORRELATION ───────
    updateAgent('correlation', { status: 'active' });
    addTimeline('🔗', '#cc5de8', 'Correlation agent analyzing cross-zone patterns...');

    const correlations = [];
    if (detected.length >= 2) {
      const corrCount = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < corrCount; i++) {
        if (!runningRef.current) return;
        const corr = generateCorrelationEvent(detected);
        correlations.push(corr);
        setCorrelationLog(prev => [corr, ...prev].slice(0, 50));
        addTimeline('🔗', '#cc5de8', `Correlation: ${corr.from_name} ↔ ${corr.to_name} (${corr.match_pct}%)`);
        await delay(600 + Math.random() * 600);
      }
    }
    setAgents(prev => prev.map(a => a.id === 'correlation' ? { ...a, status: 'done', processed: a.processed + correlations.length } : a));

    await delay(baseDelay * 0.3);
    if (!runningRef.current) return;

    // ─────── STEP 4: TRIAGE ───────
    updateAgent('triage', { status: 'active' });
    addTimeline('⚖️', '#ff922b', 'Triage agent prioritizing alerts...');

    const triaged = [];
    const escalated = [];
    for (const anomaly of detected) {
      if (!runningRef.current) return;
      const decision = generateTriageDecision(anomaly);
      triaged.push(decision);
      setTriageLog(prev => [decision, ...prev].slice(0, 100));

      if (decision.decision === 'escalated') {
        escalated.push(anomaly);
        addTimeline('🚨', '#ff3b5c', `Escalated: ${anomaly.zone_name} — ${anomaly.label}`);
        // Add to critical alerts for the map
        setCriticalAlerts(prev => [{
          id: anomaly.id,
          zone_id: anomaly.zone_id,
          zone_name: anomaly.zone_name,
          label: anomaly.label,
          icon: anomaly.icon,
          severity: anomaly.severity,
          confidence: anomaly.confidence,
          timestamp: new Date().toISOString(),
        }, ...prev].slice(0, 20));
      } else if (decision.decision === 'suppressed') {
        addTimeline('🔇', '#4a5568', `Suppressed: ${anomaly.zone_name} — noise`);
      } else if (decision.decision === 'uncertain') {
        const debate = generateDebate(decision);
        setDebates(prev => [debate, ...prev]);
        addTimeline('🗣️', '#ffd93d', `⚡ DEBATE NEEDED: ${anomaly.zone_name} — awaiting human input`);
      }
      await delay(400 + Math.random() * 400);
    }
    setAgents(prev => prev.map(a => a.id === 'triage' ? { ...a, status: 'done', processed: a.processed + triaged.length } : a));

    await delay(baseDelay * 0.3);
    if (!runningRef.current) return;

    // ─────── STEP 5: BRIEF ───────
    updateAgent('brief', { status: 'active' });
    if (escalated.length > 0) {
      addTimeline('📋', '#20c997', `Brief agent generating ${escalated.length} intelligence briefing(s)...`);
      for (const anomaly of escalated) {
        if (!runningRef.current) return;
        const brief = generateBrief(anomaly);
        setBriefLog(prev => [brief, ...prev].slice(0, 50));
        addTimeline('📋', '#20c997', `Brief generated for ${anomaly.zone_name} (${brief.tokens} tokens)`);
        await delay(800 + Math.random() * 1200);
      }
    } else {
      addTimeline('📋', '#20c997', 'No escalated alerts — brief agent idle');
    }
    setAgents(prev => prev.map(a => a.id === 'brief' ? { ...a, status: 'done', processed: a.processed + escalated.length } : a));

    await delay(baseDelay * 0.3);
    if (!runningRef.current) return;

    // ─────── STEP 6: DISPATCH ───────
    updateAgent('dispatch', { status: 'active' });
    if (escalated.length > 0) {
      addTimeline('📧', '#ff6b6b', `Dispatch agent queuing ${escalated.length} notification(s) for approval...`);
      for (const anomaly of escalated) {
        if (!runningRef.current) return;
        const dispatch = generateDispatch(anomaly);
        setDispatchLog(prev => [dispatch, ...prev].slice(0, 50));
        addTimeline('📧', '#ff6b6b', `Queued: ${dispatch.subject} → awaiting approval`);
        await delay(400 + Math.random() * 600);
      }
    } else {
      addTimeline('📧', '#ff6b6b', 'No escalated alerts — dispatch agent standby');
    }
    setAgents(prev => prev.map(a => a.id === 'dispatch' ? { ...a, status: 'done', processed: a.processed + escalated.length } : a));

    await delay(baseDelay * 0.3);
    if (!runningRef.current) return;

    // ─────── STEP 7: LEARNING ───────
    updateAgent('learning', { status: 'active' });
    addTimeline('🧠', '#ffd93d', 'Learning agent updating sensitivity thresholds...');
    const learning = generateLearningUpdate(triaged);
    setLearningLog(prev => [learning, ...prev].slice(0, 50));
    addTimeline('🧠', '#ffd93d', `${learning.zone_name}: sensitivity ${learning.old_sensitivity}→${learning.new_sensitivity} (${learning.direction})`);
    await delay(500);
    setAgents(prev => prev.map(a => a.id === 'learning' ? { ...a, status: 'done', processed: a.processed + 1 } : a));

    // ─────── CYCLE COMPLETE ───────
    addTimeline('✅', '#00d4aa', `Cycle ${cycleNum} complete — ${ingested.length} ingested, ${detected.length} detected, ${escalated.length} escalated`);

    await delay(1000);
    if (runningRef.current) {
      setAgents(prev => prev.map(a => ({ ...a, status: 'idle' })));
    }
  }, [speed, updateAgent, addTimeline]);

  // ── Start simulation ──
  const start = useCallback((intervalMs = 10000) => {
    setSpeed(intervalMs);
    runningRef.current = true;
    setIsRunning(true);

    let currentCycle = cycle;
    const loop = async () => {
      while (runningRef.current) {
        currentCycle++;
        setCycle(currentCycle);
        await runCycle(currentCycle);
        if (!runningRef.current) break;
        await new Promise(r => {
          const t = setTimeout(r, 2000);
          timersRef.current.push(t);
        });
      }
    };
    loop();
  }, [runCycle, cycle]);

  // ── Stop simulation ──
  const stop = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle' })));
  }, []);

  // ── Resolve a debate ──
  const resolveDebate = useCallback((debateId, decision) => {
    setDebates(prev => prev.map(d =>
      d.id === debateId ? { ...d, awaiting_human: false, human_decision: decision, resolved_at: new Date().toISOString() } : d
    ));
    addTimeline('👤', '#ffd93d', `Human resolved debate → ${decision}`);
  }, [addTimeline]);

  // ── Approve/reject a dispatch ──
  const approveDispatch = useCallback((dispatchId) => {
    setDispatchLog(prev => prev.map(d =>
      d.id === dispatchId ? { ...d, status: 'sending' } : d
    ));
    return dispatchId;
  }, []);

  const markDispatchSent = useCallback((dispatchId, success) => {
    setDispatchLog(prev => prev.map(d =>
      d.id === dispatchId ? { ...d, status: success ? 'sent' : 'failed', sent_at: new Date().toISOString() } : d
    ));
    if (success) addTimeline('✅', '#20c997', 'Email sent successfully');
  }, [addTimeline]);

  const rejectDispatch = useCallback((dispatchId) => {
    setDispatchLog(prev => prev.map(d =>
      d.id === dispatchId ? { ...d, status: 'rejected' } : d
    ));
    addTimeline('❌', '#ff6b6b', 'Dispatch rejected by operator');
  }, [addTimeline]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      runningRef.current = false;
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  return {
    isRunning, cycle, speed, agents, timeline, debates, criticalAlerts,
    ingestionLog, detectionLog, correlationLog, triageLog,
    briefLog, dispatchLog, learningLog,
    start, stop, resolveDebate,
    approveDispatch, markDispatchSent, rejectDispatch,
  };
}
