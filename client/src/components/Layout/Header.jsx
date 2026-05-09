import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Waves, Network, Bell, Settings, MessageSquare, AlertTriangle, LayoutDashboard, Cpu } from "lucide-react";
import "../../styles/header.css";

export default function Header({
  alertCount,
  onSettingsOpen,
  onGraphOpen,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="header" id="header">
      <div className="header-left">
        <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <Waves
            className="header-logo-icon"
            size={24}
            color="var(--accent-primary)"
          />
          <span className="header-logo-text">AquaSentinel</span>
        </div>
        <nav className="header-nav">
          <button
            className={`header-nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            <LayoutDashboard size={14} />
            Dashboard
          </button>
          <button
            className={`header-nav-link ${location.pathname === '/alerts' ? 'active' : ''}`}
            onClick={() => navigate('/alerts')}
          >
            <AlertTriangle size={14} />
            Alerts
          </button>
          <button
            className={`header-nav-link ${location.pathname === '/agents' ? 'active' : ''}`}
            onClick={() => navigate('/agents')}
          >
            <Cpu size={14} />
            Agents
          </button>
          <button
            className={`header-nav-link ${location.pathname === '/chat' ? 'active' : ''}`}
            onClick={() => navigate('/chat')}
          >
            <MessageSquare size={14} />
            Chat
          </button>
          <button
            className={`header-nav-link ${location.pathname === '/knowledgegraph' ? 'active' : ''}`}
            onClick={() => navigate('/knowledgegraph')}
          >
            <Network size={14} />
            Graph
          </button>
        </nav>
      </div>
      <div className="header-controls">
        <button
          className="btn btn-sm header-btn-graph"
          onClick={() => navigate('/knowledgegraph')}
          title="Knowledge Graph"
        >
          <Network size={14} /> Graph
        </button>
        <div
          className="header-notification"
          id="notification-bell"
          title="Alerts"
          onClick={() => navigate('/alerts')}
          style={{ cursor: 'pointer' }}
        >
          <Bell size={18} />
          {alertCount > 0 && (
            <span className="header-notification-badge">{alertCount}</span>
          )}
        </div>
        <div
          className="header-gear"
          onClick={onSettingsOpen}
          id="settings-btn"
          title="Settings"
        >
          <Settings size={18} />
        </div>
      </div>
    </header>
  );
}
