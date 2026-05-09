import React from 'react';
import AlertCard from './AlertCard';

export default function AlertFeed({ alerts, stats, onFeedback }) {
  return (
    <div className="sidebar-content" id="alert-feed">
      {alerts.map((alert, i) => (
        <AlertCard key={alert.id} alert={alert} onFeedback={onFeedback} />
      ))}
      {stats && (
        <div className="suppressed-counter">
          {stats.suppressed} alerts suppressed (<span className="accent">{stats.noise_pct}% noise reduced</span>)
        </div>
      )}
    </div>
  );
}
