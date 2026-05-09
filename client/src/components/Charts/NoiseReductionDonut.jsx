import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Suppressed', value: 47, color: '#4a5568' },
  { name: 'Escalated', value: 5, color: '#ff3b5c' },
];

export default function NoiseReductionDonut() {
  return (
    <div className="chart-card glass-card">
      <div className="chart-card-title">Noise Reduction</div>
      <div className="chart-card-body" style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" dataKey="value" startAngle={90} endAngle={-270} animationDuration={1200}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: 'rgba(15,31,61,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00d4aa' }}>71%</div>
          <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>noise cut</div>
        </div>
      </div>
    </div>
  );
}
