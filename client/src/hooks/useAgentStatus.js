import { useState, useEffect, useCallback, useRef } from 'react';
import { connectAgentSSE } from '../services/api';

const INITIAL_AGENTS = [
  { id: 'ingestion',   name: 'Ingestion',   icon: '📡', status: 'idle', processed: 0 },
  { id: 'detection',   name: 'Detection',   icon: '🔍', status: 'idle', processed: 0 },
  { id: 'correlation', name: 'Correlation', icon: '🔗', status: 'idle', processed: 0 },
  { id: 'triage',      name: 'Triage',      icon: '⚖️', status: 'idle', processed: 0 },
  { id: 'brief',       name: 'Brief',       icon: '📋', status: 'idle', processed: 0 },
  { id: 'dispatch',    name: 'Dispatch',    icon: '🚨', status: 'idle', processed: 0 },
  { id: 'learning',    name: 'Learning',    icon: '🧠', status: 'idle', processed: 0 },
];

export default function useAgentStatus() {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [cycle, setCycle] = useState(0);
  const [timeline, setTimeline] = useState([]);
  const [latestAlerts, setLatestAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const sourceRef = useRef(null);

  const updateAgent = useCallback((name, updates) => {
    setAgents(prev => prev.map(a => a.id === name ? { ...a, ...updates } : a));
  }, []);

  const addTimelineEvent = useCallback((evt, data) => {
    const TIMELINE_COLORS = {
      reading_ingested: '#00d4aa', anomaly_detected: '#ff9f43', correlation_found: '#cc5de8',
      alert_suppressed: '#4a5568', alert_escalated: '#ff3b5c', brief_generated: '#51cf66',
      email_dispatched: '#3b82f6', sensitivity_updated: '#ffd93d', cycle_complete: '#00d4aa',
    };
    const TIMELINE_ICONS = {
      reading_ingested: '📡', anomaly_detected: '🔍', correlation_found: '🔗',
      alert_suppressed: '🔇', alert_escalated: '🚨', brief_generated: '📋',
      email_dispatched: '📧', sensitivity_updated: '🧠', cycle_complete: '✅',
    };
    const text =
      evt === 'reading_ingested' ? `Ingested ${data.zone_name}` :
      evt === 'anomaly_detected' ? `${data.type} in Z${data.zone_id} (${data.severity})` :
      evt === 'correlation_found' ? `Correlation ${data.from}→${data.to}` :
      evt === 'alert_suppressed' ? `Suppressed #${data.anomaly_id}` :
      evt === 'alert_escalated' ? `Escalated: ${data.zone} (${data.severity})` :
      evt === 'brief_generated' ? `Brief for Z${data.zone_id}` :
      evt === 'email_dispatched' ? `Email → ${data.to}` :
      evt === 'sensitivity_updated' ? `${data.zone_name}: ${data.old}→${data.new}` :
      evt === 'cycle_complete' ? `Cycle ${data.cycle} done` : evt;

    setTimeline(prev => [...prev, {
      id: `${evt}-${Date.now()}`,
      icon: TIMELINE_ICONS[evt] || '•',
      color: TIMELINE_COLORS[evt] || '#94a3b8',
      text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }].slice(-30)); // keep last 30 events
  }, []);

  const handleEvent = useCallback((evt, data) => {
    if (evt === 'agent_status') {
      updateAgent(data.agent, {
        status: data.status,
        ...(data.processed != null ? { processed: data.processed } : {}),
      });
    }
    if (evt === 'anomaly_detected' || evt === 'alert_escalated') {
      setLatestAlerts(prev => [{ ...data, event: evt, ts: Date.now() }, ...prev].slice(0, 20));
    }
    if (evt === 'cycle_complete') {
      setCycle(data.cycle);
    }

    // Always add to timeline (except raw agent_status)
    if (evt !== 'agent_status') {
      addTimelineEvent(evt, data);
    }
  }, [updateAgent, addTimelineEvent]);

  const connect = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
    }
    try {
      const source = connectAgentSSE(handleEvent);
      sourceRef.current = source;
      setIsConnected(true);
    } catch (err) {
      console.warn('SSE connection failed:', err);
      setIsConnected(false);
    }
  }, [handleEvent]);

  const disconnect = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
    setIsConnected(false);
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle' })));
  }, []);

  const reset = useCallback(() => {
    setAgents(INITIAL_AGENTS);
    setCycle(0);
    setTimeline([]);
    setLatestAlerts([]);
  }, []);

  useEffect(() => {
    return () => {
      if (sourceRef.current) sourceRef.current.close();
    };
  }, []);

  return { agents, cycle, timeline, latestAlerts, isConnected, connect, disconnect, reset };
}
