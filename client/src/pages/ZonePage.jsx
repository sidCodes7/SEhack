import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Waves, ArrowLeft, Thermometer, Droplets, Wind, Activity, AlertTriangle } from 'lucide-react';
import { ZONES, METRIC_CONFIG, SEVERITY_CONFIG } from '../data/zones';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import '../styles/zone-page.css';

const API = 'http://localhost:3001';

export default function ZonePage() {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const zone = ZONES.find(z => z.id === zoneId || z.id === `Z${zoneId}` || String(z.id) === zoneId);
  const [timeseriesData, setTimeseriesData] = useState({});
  const [anomalies, setAnomalies] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('sst');
  const [loading, setLoading] = useState(true);

  const numId = zoneId.startsWith('Z') ? zoneId.slice(1) : zoneId;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch timeseries for all metrics
        const metrics = ['sst', 'chlorophyll', 'dissolved_o2', 'ph', 'turbidity', 'salinity'];
        const results = {};
        await Promise.all(metrics.map(async (m) => {
          try {
            const res = await fetch(`${API}/api/readings/timeseries?zone_id=${numId}&metric=${m}&days=30`);
            const data = await res.json();
            results[m] = data.values?.map((v, i) => ({
              time: new Date(data.timestamps[i]).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
              value: parseFloat(v.toFixed(2)),
              timestamp: data.timestamps[i],
            })) || [];
          } catch { results[m] = []; }
        }));
        setTimeseriesData(results);

        // Fetch anomalies
        try {
          const aRes = await fetch(`${API}/api/zones/${numId}/anomalies`);
          setAnomalies(await aRes.json());
        } catch { setAnomalies([]); }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchData();
  }, [numId]);

  if (!zone) {
    return (
      <div className="zone-page">
        <div className="zone-page-header">
          <button className="btn btn-back" onClick={() => navigate('/')}><ArrowLeft size={18} /> Back</button>
          <h1>Zone not found</h1>
        </div>
      </div>
    );
  }

  const sevConfig = SEVERITY_CONFIG[zone.severity] || SEVERITY_CONFIG.normal;
  const metrics = Object.entries(METRIC_CONFIG);
  const currentData = timeseriesData[selectedMetric] || [];
  const metricInfo = METRIC_CONFIG[selectedMetric];

  return (
    <div className="zone-page">
      <header className="zone-page-header">
        <div className="zone-page-nav">
          <button className="btn btn-back" onClick={() => navigate('/')}>
            <ArrowLeft size={18} /> Dashboard
          </button>
          <div className="zone-page-breadcrumb">
            <span className="text-dim">Zones /</span>
            <span>{zone.name}</span>
          </div>
        </div>
        <div className="zone-page-title-row">
          <div className="zone-page-icon">{zone.icon}</div>
          <div>
            <h1 className="zone-page-name">{zone.name}</h1>
            <p className="zone-page-region">{zone.region} · {zone.risk}</p>
          </div>
          <div className="zone-page-severity" style={{ '--sev-color': sevConfig.color }}>
            <span className="zone-severity-dot" style={{ background: sevConfig.color }} />
            {sevConfig.label}
          </div>
        </div>
      </header>

      {/* Metric Cards Grid */}
      <div className="zone-metrics-grid">
        {metrics.map(([key, cfg]) => {
          const current = zone.current?.[key];
          const baseline = zone.baseline?.[key];
          const diff = current && baseline ? (current - baseline).toFixed(2) : null;
          const isHigh = diff > 0;
          return (
            <button
              key={key}
              className={`zone-metric-card glass-card ${selectedMetric === key ? 'active' : ''}`}
              onClick={() => setSelectedMetric(key)}
              style={{ '--metric-color': cfg.color }}
            >
              <div className="zone-metric-label">{cfg.icon} {cfg.label}</div>
              <div className="zone-metric-value">
                {current?.toFixed(1) || '—'}
                <span className="zone-metric-unit">{cfg.unit}</span>
              </div>
              {diff !== null && (
                <div className={`zone-metric-diff ${isHigh ? 'up' : 'down'}`}>
                  {isHigh ? '▲' : '▼'} {Math.abs(diff)} from baseline
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Chart */}
      <div className="zone-chart-main glass-card">
        <div className="zone-chart-header">
          <h2>{metricInfo.icon} {metricInfo.label} — 30 Day Trend</h2>
          <span className="text-dim">{currentData.length} data points</span>
        </div>
        {loading ? (
          <div className="zone-chart-loading">Loading chart data...</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={currentData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metricInfo.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={metricInfo.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
              <YAxis stroke="#475569" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="value" stroke={metricInfo.color} fill="url(#metricGradient)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Anomalies List */}
      <div className="zone-anomalies glass-card">
        <h2><AlertTriangle size={18} /> Active Anomalies ({anomalies.length})</h2>
        {anomalies.length === 0 ? (
          <p className="text-dim" style={{ padding: '1rem' }}>No anomalies detected for this zone.</p>
        ) : (
          <div className="zone-anomaly-list">
            {anomalies.map((a, i) => (
              <div key={a.id || i} className={`zone-anomaly-item ${a.severity}`}>
                <div className="zone-anomaly-header">
                  <span className={`badge badge-${a.severity}`}>{a.severity?.toUpperCase()}</span>
                  <span className="zone-anomaly-type">{a.anomaly_type?.replace(/_/g, ' ')}</span>
                  <span className="zone-anomaly-confidence">{a.confidence}% confidence</span>
                </div>
                <p className="zone-anomaly-reasoning">{a.reasoning}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
