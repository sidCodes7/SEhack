import { useState, useEffect, useCallback, useRef } from 'react';
import { getAlerts, getAlertStats, submitFeedback } from '../services/api';
import { MOCK_ALERTS, MOCK_ALERT_STATS } from '../data/mockData';

export default function useAlerts() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [stats, setStats] = useState(MOCK_ALERT_STATS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [alertsData, statsData] = await Promise.all([getAlerts(), getAlertStats()]);
      if (!mounted.current) return;

      if (alertsData) {
        // Map server format to client format
        setAlerts(alertsData.map(a => ({
          id: a.id,
          zone_id: `Z${a.zone_id}`,
          zone_name: a.zone_name,
          type: a.anomaly_type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          severity: a.severity,
          confidence: a.confidence,
          reasoning: a.reasoning,
          brief: a.brief,
          timestamp: a.detected_at,
          icon: a.severity === 'critical' ? '🔴' : a.severity === 'warning' ? '🟠' : '🟡',
        })));
      }

      if (statsData) {
        setStats({
          total: statsData.total,
          escalated: statsData.escalated,
          suppressed: statsData.suppressed,
          noise_pct: statsData.noise_pct,
        });
      }
    } catch (err) {
      if (mounted.current) setError(err.message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  const handleFeedback = useCallback(async (alertId, isValid) => {
    // Immediately remove the alert from the UI
    setAlerts(prev => prev.filter(a => a.id !== alertId));

    // Send feedback to the backend (persists to DB)
    const numericId = typeof alertId === 'string' ? parseInt(alertId.replace(/\D/g, '')) : alertId;
    const result = await submitFeedback(numericId, { was_valid: isValid });
    if (result) {
      console.log(`Feedback recorded: alert ${alertId} → ${isValid ? 'valid' : 'false positive'}`);
      // Refresh stats after feedback
      try {
        const statsData = await getAlertStats();
        if (statsData && mounted.current) {
          setStats({
            total: statsData.total,
            escalated: statsData.escalated,
            suppressed: statsData.suppressed,
            noise_pct: statsData.noise_pct,
          });
        }
      } catch {}
    }
  }, []);

  // Merge live SSE alerts into the feed
  const injectAlert = useCallback((newAlert) => {
    setAlerts(prev => [newAlert, ...prev].slice(0, 20));
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchAlerts();
    return () => { mounted.current = false; };
  }, [fetchAlerts]);

  return { alerts, stats, loading, error, fetchAlerts, handleFeedback, injectAlert };
}
