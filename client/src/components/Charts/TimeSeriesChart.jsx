import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MOCK_TIMESERIES } from '../../data/mockData';

export default function TimeSeriesChart() {
  const data = MOCK_TIMESERIES.Z1?.sst?.map((p, i) => ({
    day: i + 1,
    sst: p.value,
    chlor: MOCK_TIMESERIES.Z1?.chlorophyll?.[i]?.value,
    o2: MOCK_TIMESERIES.Z1?.dissolved_o2?.[i]?.value,
  })) || [];

  return (
    <div className="chart-card glass-card">
      <div className="chart-card-title">30-Day Trends (Z1)</div>
      <div className="chart-card-body">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#475569' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#475569' }} tickLine={false} axisLine={false} width={30} />
            <Tooltip
              contentStyle={{ background: 'rgba(15,31,61,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Line type="monotone" dataKey="sst" stroke="#ff6b6b" strokeWidth={2} dot={false} name="SST °C" />
            <Line type="monotone" dataKey="chlor" stroke="#51cf66" strokeWidth={1.5} dot={false} name="Chlor mg/m³" />
            <Line type="monotone" dataKey="o2" stroke="#339af0" strokeWidth={1.5} dot={false} name="O₂ mg/L" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
