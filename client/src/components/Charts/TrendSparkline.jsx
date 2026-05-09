import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

// Compact 7-day sparkline for zone detail panel
export default function TrendSparkline({ data, color = '#00d4aa', label = '' }) {
  // data should be [{value}, ...] — 7 entries
  if (!data || data.length < 2) {
    return (
      <div style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>No data</span>
      </div>
    );
  }

  const trend = data[data.length - 1].value - data[0].value;
  const trendDir = trend > 0.1 ? '▲' : trend < -0.1 ? '▼' : '→';
  const trendColor = trend > 0.1 ? 'var(--severity-critical)' : trend < -0.1 ? 'var(--accent-primary)' : 'var(--text-dim)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: 32 }}>
      <div style={{ flex: 1, height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <defs>
              <linearGradient id={`sparkGrad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#sparkGrad-${label})`}
              dot={false}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <span style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: trendColor, minWidth: '16px' }}>
        {trendDir}
      </span>
    </div>
  );
}
