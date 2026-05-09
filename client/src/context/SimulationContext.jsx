// ═══════════════════════════════════════════════════════════════
// AquaSentinel — Global Simulation Context
// Shares simulation state across all pages (AgentsPage, AgentDetailPage)
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext } from 'react';
import useSimulation from '../hooks/useSimulation';

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  const sim = useSimulation();
  return (
    <SimulationContext.Provider value={sim}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulationContext() {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    // Return a fallback so pages work even without provider
    return {
      isRunning: false, cycle: 0, speed: 10000,
      agents: [], timeline: [], debates: [],
      ingestionLog: [], detectionLog: [], correlationLog: [],
      triageLog: [], briefLog: [], dispatchLog: [], learningLog: [],
      start: () => {}, stop: () => {}, resolveDebate: () => {},
    };
  }
  return ctx;
}
