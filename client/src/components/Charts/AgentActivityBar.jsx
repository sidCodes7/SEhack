import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { agent: '📡 Ingest', messages: 24, fill: '#00d4aa' },
  { agent: '🔍 Detect', messages: 18, fill: '#3b82f6' },
  { agent: '🔗 Correlate', messages: 8, fill: '#cc5de8' },
  { agent: '⚖️ Triage', messages: 12, fill: '#ff9f43' },
  { agent: '📋 Brief', messages: 5, fill: '#51cf66' },
  { agent: '🚨 Dispatch', messages: 3, fill: '#ff3b5c' },
  { agent: '🧠 Learn', messages: 4, fill: '#ffd93d' },
];

export default function AgentActivityBar() {
  return (
    <div className="chart-card glass-card">
      <div className="chart-card-title">Agent Activity</div>
      <div className="chart-card-body">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 9, fill: '#475569' }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="agent" tick={{ fontSize: 8, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={70} />
            <Tooltip contentStyle={{ background: 'rgba(15,31,61,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey="messages" radius={[0, 4, 4, 0]} animationDuration={1200}>
              {data.map((entry, i) => (
                <rect key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
