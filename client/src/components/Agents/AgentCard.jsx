import React from 'react';

export default function AgentCard({ agent }) {
  const { icon, name, status, processed } = agent;
  const statusLabels = { active: 'Active', processing: 'Processing', idle: 'Idle', error: 'Error' };

  return (
    <div className={`agent-card ${status}`} id={`agent-${agent.id}`}>
      <span className="agent-card-icon">{icon}</span>
      <div className="agent-card-info">
        <span className="agent-card-name">{name}</span>
        <span className="agent-card-meta">{processed} processed</span>
      </div>
      <div className={`agent-card-status ${status}`} title={statusLabels[status] || 'Idle'} />
    </div>
  );
}
