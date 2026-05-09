import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Z1 Thermal', score: 87, fill: '#ff3b5c' },
  { name: 'Z2 HAB', score: 72, fill: '#ff9f43' },
  { name: 'Z3 Hypoxia', score: 68, fill: '#ff9f43' },
  { name: 'Z4 Turbidity', score: 54, fill: '#ffd93d' },
  { name: 'Z5 Bleaching', score: 45, fill: '#ffd93d' },
];

export default function ConfidenceRadial() {
  return (
    <div className="chart-card glass-card">
      <div className="chart-card-title">Anomaly Confidence</div>
      <div className="chart-card-body">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={data} startAngle={180} endAngle={0}>
            <RadialBar background={{ fill: 'rgba(255,255,255,0.03)' }} dataKey="score" cornerRadius={4} animationDuration={1200} />
            <Tooltip contentStyle={{ background: 'rgba(15,31,61,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
