// ──────────────────────────────────────────────
// Aether Super App — Main Application
// ──────────────────────────────────────────────
// Auth flow: Login → Role Select → Dashboard
// Stores JWT for API calls. Role-based routing.

import { useState, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import RoleSelector from './components/RoleSelector';
import HostShell from './components/HostShell';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Demo users for quick login (match seed data)
const DEMO_USERS = [
  { email: 'priyank@aether.edu', password: 'aether123', name: 'Priyank', role: 'student', department: 'Computer Science' },
  { email: 'harshav@aether.edu', password: 'aether123', name: 'Prof. Harshav', role: 'professor', department: 'Computer Science' },
  { email: 'admin@aether.edu', password: 'aether123', name: 'Admin', role: 'admin', department: 'Administration' },
];

/**
 * Attempt real backend login. Returns { success, token, user } or null on failure.
 */
async function realLogin(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.token) {
        return { success: true, token: data.data.token, user: data.data.user };
      }
    }
  } catch {
    // API unavailable
  }
  return null;
}

export default function App() {
  const [screen, setScreen] = useState('login'); // login | role-select | app
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const handleLogin = useCallback(async (email, password) => {
    // Try real API first
    const result = await realLogin(email, password);
    if (result) {
      setToken(result.token);
      setUser(result.user);
      setScreen('app');
      return { success: true };
    }

    // Fallback: match against demo users but still try to get a token
    const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (demoUser) {
      // Try registering the demo user (in case DB is empty), then login
      try {
        await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: demoUser.name, email: demoUser.email, password: demoUser.password, role: demoUser.role, department: demoUser.department }),
        });
      } catch {}

      const retryResult = await realLogin(email, password);
      if (retryResult) {
        setToken(retryResult.token);
        setUser(retryResult.user);
        setScreen('app');
        return { success: true };
      }

      // True fallback: use demo token (API endpoints will get 401 but frontend handles gracefully)
      setToken('demo-jwt-token');
      setUser({ id: demoUser.email, name: demoUser.name, role: demoUser.role, department: demoUser.department, email: demoUser.email });
      setScreen('app');
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  }, []);

  const handleRoleSelect = useCallback(async (selectedUser) => {
    const demo = DEMO_USERS.find(u => u.role === selectedUser.role);
    if (!demo) return;

    // Try real login first
    const result = await realLogin(demo.email, demo.password);
    if (result) {
      setToken(result.token);
      setUser(result.user);
      setScreen('app');
      return;
    }

    // Try register then login
    try {
      await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: demo.name, email: demo.email, password: demo.password, role: demo.role, department: demo.department }),
      });
    } catch {}

    const retryResult = await realLogin(demo.email, demo.password);
    if (retryResult) {
      setToken(retryResult.token);
      setUser(retryResult.user);
      setScreen('app');
      return;
    }

    // Final fallback
    setToken('demo-jwt-token');
    setUser({ id: demo.email, name: demo.name, role: demo.role, department: demo.department, email: demo.email });
    setScreen('app');
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    setScreen('login');
  }, []);

  if (screen === 'login') {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onSwitchToRoles={() => setScreen('role-select')}
      />
    );
  }

  if (screen === 'role-select') {
    return (
      <RoleSelector
        onSelect={handleRoleSelect}
        onBack={() => setScreen('login')}
      />
    );
  }

  return (
    <HostShell 
      user={user} 
      token={token} 
      apiBase={API_BASE} 
      onLogout={handleLogout}
    />
  );
}
