import React from 'react';
import AgentCard from './AgentCard';
import '../../styles/agents.css';

export default function AgentStatusStrip({ agents, cycle, uptime }) {
  return (
    <div className="agent-strip" id="agent-strip">
      {agents.map((agent, i) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
      <div className="agent-strip-meta">
        <span>Cycle: <span className="accent">{cycle}</span></span>
        <span>Uptime: <span className="accent">{uptime}</span></span>
      </div>
    </div>
  );
}
