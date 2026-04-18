// ──────────────────────────────────────────────
// Aether Super App — Main Application
// ──────────────────────────────────────────────

import { useState } from 'react';
import HostShell from './components/HostShell';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export default function App() {
  // Mock user for dev — in production, this would come from auth
  const [user] = useState({
    userName: 'Priyank',
    role: 'student',
    department: 'Computer Science',
  });

  return (
    <HostShell user={user} apiBase={API_BASE} />
  );
}
