import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { zone: 'Z1', escalated: 3, suppressed: 8 },
  { zone: 'Z2', escalated: 2, suppressed: 12 },
  { zone: 'Z3', escalated: 1, suppressed: 9 },
  { zone: 'Z4', escalated: 0, suppressed: 6 },
  { zone: 'Z5', escalated: 1, suppressed: 5 },
  { zone: 'Z6', escalated: 0, suppressed: 3 },
  { zone: 'Z7', escalated: 0, suppressed: 2 },
  { zone: 'Z8', escalated: 0, suppressed: 2 },
];

export default function AlertVolumeBar() {
  return (
    <div className="chart-card glass-card">
      <div className="chart-card-title">Alert Volume</div>
      <div className="chart-card-body">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="zone" tick={{ fontSize: 9, fill: '#475569' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#475569' }} tickLine={false} axisLine={false} width={25} />
            <Tooltip contentStyle={{ background: 'rgba(15,31,61,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey="suppressed" stackId="a" fill="#4a5568" radius={[0, 0, 0, 0]} name="Suppressed" />
            <Bar dataKey="escalated" stackId="a" fill="#ff3b5c" radius={[2, 2, 0, 0]} name="Escalated" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
