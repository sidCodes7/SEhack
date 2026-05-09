import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import ErrorBoundary from '../components/Layout/ErrorBoundary';
import MapView from '../components/Map/MapView';
import AlertFeed from '../components/Alerts/AlertFeed';
import ChatPanel from '../components/Chat/ChatPanel';
import ChartsStrip from '../components/Charts/ChartsStrip';
import ZoneDetail from '../components/Layout/ZoneDetail';
import GraphPanel from '../components/KnowledgeGraph/GraphPanel';
import EmailPreview from '../components/Alerts/EmailPreview';
import SettingsPanel from '../components/Layout/SettingsPanel';
import useAlerts from '../hooks/useAlerts';
import useChat from '../hooks/useChat';
import { useSimulationContext } from '../context/SimulationContext';
import { ZONES } from '../data/zones';
import '../styles/dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { alerts, stats, handleFeedback } = useAlerts();
  const { messages, isTyping, sendMessage } = useChat();
  const sim = useSimulationContext();

  const [selectedZone, setSelectedZone] = useState(null);
  const [showGraph, setShowGraph] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [emailZone, setEmailZone] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('alerts');

  return (
    <div className="dashboard" id="dashboard">
      <Header
        alertCount={alerts.filter(a => a.severity === 'critical').length}
        onSettingsOpen={() => setShowSettings(true)}
        onGraphOpen={() => setShowGraph(true)}
      />

      <div className="dashboard-main">
        <div className="dashboard-center">
          <div className="dashboard-map-area">
            <ErrorBoundary>
              <MapView zones={ZONES} criticalAlerts={sim.criticalAlerts} onZoneClick={(z) => navigate(`/zones/${z.id}`)} />
            </ErrorBoundary>
          </div>
          <ErrorBoundary>
            <ChartsStrip />
          </ErrorBoundary>
        </div>

        <div className="sidebar" id="sidebar">
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab ${sidebarTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setSidebarTab('alerts')}
            >
              <span className="sidebar-tab-icon">🔔</span>
              <span>Alerts</span>
              {alerts.length > 0 && <span className="sidebar-tab-badge">{alerts.length}</span>}
            </button>
            <button
              className={`sidebar-tab ${sidebarTab === 'chat' ? 'active' : ''}`}
              onClick={() => setSidebarTab('chat')}
            >
              <span className="sidebar-tab-icon">💬</span>
              <span>Chat</span>
            </button>
          </div>
          {sidebarTab === 'alerts' ? (
            <AlertFeed alerts={alerts} stats={stats} onFeedback={handleFeedback} />
          ) : (
            <ChatPanel
              messages={messages}
              isTyping={isTyping}
              onSend={sendMessage}
            />
          )}
        </div>
      </div>

      {selectedZone && (
        <ZoneDetail
          zone={selectedZone}
          onClose={() => setSelectedZone(null)}
          onEmailPreview={(z) => { setEmailZone(z); setSelectedZone(null); }}
        />
      )}
      {showGraph && (
        <ErrorBoundary>
          <GraphPanel onClose={() => setShowGraph(false)} />
        </ErrorBoundary>
      )}
      {emailZone && (
        <EmailPreview
          zone={emailZone}
          onClose={() => setEmailZone(null)}
          onSend={(recipient) => console.log('Email sent to:', recipient)}
        />
      )}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
