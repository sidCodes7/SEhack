// ──────────────────────────────────────────────
// HostShell — Main Shell Component
// ──────────────────────────────────────────────
// Wraps the entire Super App: nav + views.

import { useState } from 'react';
import MiniAppDashboard from './MiniAppDashboard';
import IframeContainer from './IframeContainer';
import DeveloperPortal from './DeveloperPortal';
import AdminAuditView from './AdminAuditView';
import './HostShell.css';

export default function HostShell({ user, apiBase }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedPlugin, setSelectedPlugin] = useState(null);

  const handlePluginClick = (plugin) => {
    setSelectedPlugin(plugin);
    setActiveView('iframe');
  };

  const handleBack = () => {
    setSelectedPlugin(null);
    setActiveView('dashboard');
  };

  return (
    <div className="host-shell">
      {/* Top Navigation */}
      <nav className="shell-nav">
        <div className="nav-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-text">Aether Super App</span>
        </div>

        <div className="nav-links">
          <button
            className={`nav-link ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveView('dashboard'); setSelectedPlugin(null); }}
          >
            🧩 Apps
          </button>
          <button
            className={`nav-link ${activeView === 'developer' ? 'active' : ''}`}
            onClick={() => setActiveView('developer')}
          >
            🛠️ Developer
          </button>
          {user.role === 'admin' && (
            <button
              className={`nav-link ${activeView === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveView('admin')}
            >
              🛡️ Admin
            </button>
          )}
        </div>

        <div className="nav-user">
          <span className="user-name">{user.userName}</span>
          <span className="user-badge">{user.role}</span>
        </div>
      </nav>

      {/* View Content */}
      <main className="shell-content">
        {activeView === 'dashboard' && (
          <MiniAppDashboard apiBase={apiBase} onPluginClick={handlePluginClick} />
        )}
        {activeView === 'iframe' && selectedPlugin && (
          <IframeContainer plugin={selectedPlugin} user={user} onBack={handleBack} />
        )}
        {activeView === 'developer' && (
          <DeveloperPortal apiBase={apiBase} />
        )}
        {activeView === 'admin' && (
          <AdminAuditView apiBase={apiBase} />
        )}
      </main>
    </div>
  );
}
