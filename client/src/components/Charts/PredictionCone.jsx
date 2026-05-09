import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Prediction cone: actual values + forecast band (upper/lower confidence bounds)
export default function PredictionCone({ data, metric = 'SST', unit = '°C' }) {
  // data should be [{day, actual, forecast, upper, lower}, ...]
  // First N entries are actual, remaining are forecast
  if (!data || data.length < 3) {
    return (
      <div className="chart-card glass-card">
        <div className="chart-card-title">Forecast — {metric}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', fontSize: 'var(--text-xs)' }}>
          Insufficient data
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card glass-card">
      <div className="chart-card-title">7-Day Forecast — {metric}</div>
      <div className="chart-card-body">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="coneBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff9f43" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#ff9f43" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#475569' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#475569' }} tickLine={false} axisLine={false} width={35} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                background: 'rgba(15,31,61,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                fontSize: 11,
              }}
              formatter={(val) => [`${val} ${unit}`]}
            />
            {/* Confidence band (upper) */}
            <Area type="monotone" dataKey="upper" stroke="none" fill="url(#coneBand)" fillOpacity={1} dot={false} />
            {/* Confidence band (lower) — fill transparent to punch hole */}
            <Area type="monotone" dataKey="lower" stroke="none" fill="var(--bg-primary)" fillOpacity={1} dot={false} />
            {/* Forecast center line */}
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#ff9f43"
              strokeWidth={2}
              strokeDasharray="6 3"
              fill="none"
              dot={false}
              name="Forecast"
            />
            {/* Actual values */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#00d4aa"
              strokeWidth={2}
              fill="none"
              dot={{ r: 2, fill: '#00d4aa' }}
              name="Actual"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Helper to generate mock prediction data
export function generatePredictionData(baseValue = 29.0, days = 14) {
  const data = [];
  const actualDays = 7;
  for (let i = 0; i < days; i++) {
    const drift = i * 0.05 + (Math.random() - 0.3) * 0.3;
    const val = +(baseValue + drift).toFixed(2);
    if (i < actualDays) {
      data.push({ day: `D${i + 1}`, actual: val, forecast: null, upper: null, lower: null });
    } else {
      const forecastDrift = (i - actualDays + 1) * 0.12;
      const spread = (i - actualDays + 1) * 0.15;
      const fc = +(baseValue + drift + forecastDrift).toFixed(2);
      data.push({
        day: `D${i + 1}`,
        actual: null,
        forecast: fc,
        upper: +(fc + spread).toFixed(2),
        lower: +(fc - spread).toFixed(2),
      });
    }
  }
  return data;
}
