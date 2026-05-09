import React, { useState } from 'react';
import '../../styles/alerts.css';

export default function AlertCard({ alert, onFeedback }) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(alert.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const confidence = typeof alert.confidence === 'number' ? alert.confidence.toFixed(0) : alert.confidence;

  return (
    <div className={`alert-card glass-card ${alert.severity}`} id={`alert-${alert.id}`} onClick={() => setExpanded(!expanded)}>
      <div className="alert-card-header">
        <div className="alert-card-zone">
          <span className="alert-card-icon">{alert.icon}</span>
          <span>{alert.zone_name}</span>
        </div>
        <span className="alert-card-time">{time}</span>
      </div>

      <div className="alert-card-type">{alert.type?.replace(/_/g, ' ')}</div>

      <div className="alert-card-confidence">
        <div className="alert-card-confidence-label">
          <span>Confidence</span>
          <span className="alert-card-confidence-value">{confidence}%</span>
        </div>
        <div className="confidence-bar">
          <div className="confidence-bar-fill" style={{ width: `${alert.confidence}%` }} />
        </div>
      </div>

      {expanded && (
        <div className="alert-card-reasoning">{alert.reasoning}</div>
      )}

      <div className="alert-card-actions">
        <button className="btn btn-sm btn-expand" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}>
          {expanded ? '▲ Collapse' : '▼ Expand'}
        </button>
        <button className="btn btn-sm btn-valid"
          onClick={(e) => { e.stopPropagation(); onFeedback?.(alert.id, true); }}>✅ Valid</button>
        <button className="btn btn-sm btn-invalid"
          onClick={(e) => { e.stopPropagation(); onFeedback?.(alert.id, false); }}>❌ False</button>
      </div>
    </div>
  );
}
