import React from 'react';
import '../../styles/skeleton.css';

export function SkeletonLine({ width = '100%', height = 14 }) {
  return <div className="skeleton-line" style={{ width, height }} />;
}

export function SkeletonCard({ lines = 3, height }) {
  return (
    <div className="skeleton-card glass-card" style={height ? { height } : {}}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={i === 0 ? '60%' : i === lines - 1 ? '40%' : '85%'} />
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="skeleton-card glass-card chart-card">
      <SkeletonLine width="40%" height={10} />
      <div className="skeleton-chart-area" />
    </div>
  );
}

export function SkeletonMap() {
  return (
    <div className="skeleton-map">
      <div className="skeleton-shimmer" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }} />
    </div>
  );
}
