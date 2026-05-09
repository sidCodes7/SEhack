import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import Dashboard from './pages/Dashboard';
import ZonePage from './pages/ZonePage';
import AlertsPage from './pages/AlertsPage';
import ChatPage from './pages/ChatPage';
import AgentsPage from './pages/AgentsPage';
import AgentDetailPage from './pages/AgentDetailPage';
import KnowledgeGraphPage from './pages/KnowledgeGraphPage';
import './styles/skeleton.css';

export default function App() {
  return (
    <SimulationProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/zones/:zoneId" element={<ZonePage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/agents/:agentId" element={<AgentDetailPage />} />
        <Route path="/knowledgegraph" element={<KnowledgeGraphPage />} />
      </Routes>
    </SimulationProvider>
  );
}
