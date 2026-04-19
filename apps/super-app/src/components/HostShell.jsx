// ──────────────────────────────────────────────
// HostShell — Main app shell with bottom nav
// Role-based views for student/professor/admin
// All screens wired to real backend with fallback
// ──────────────────────────────────────────────

import { useState, useCallback } from 'react';
import StudentDashboard from './StudentDashboard';
import ProfessorDashboard from './ProfessorDashboard';
import AdminDashboard from './AdminDashboard';
import CalendarView from './CalendarView';
import CampusIssueHeatmap from './CampusIssueHeatmap';
import ReportIssue from './ReportIssue';
import FinanceView from './FinanceView';
import PYQView from './PYQView';
import AttendanceView from './AttendanceView';
import CopilotChat from './CopilotChat';
import KarmaView from './KarmaView';
import MiniAppDashboard from './MiniAppDashboard';
import DeveloperPortal from './DeveloperPortal';
import AdminAuditView from './AdminAuditView';
import IframeContainer from './IframeContainer';
import SubmitRequest from './SubmitRequest';
import TrackRequest from './TrackRequest';
import ApprovalsQueue from './ApprovalsQueue';
import NoticePublisher from './NoticePublisher';
import EditorialFeed from './EditorialFeed';
import './HostShell.css';

// Nav items for each role
const STUDENT_NAV = [
  { id: 'home', icon: 'home', label: 'Home', filled: true },
  { id: 'calendar', icon: 'calendar_today', label: 'Schedule' },
  { id: 'karma', icon: 'auto_graph', label: 'Karma' },
  { id: 'copilot', icon: 'auto_awesome', label: 'Copilot' },
  { id: 'profile', icon: 'person', label: 'Profile' },
];

const PROFESSOR_NAV = [
  { id: 'home', icon: 'grid_view', label: 'Home', filled: true },
  { id: 'attendance', icon: 'edit_note', label: 'Attend.' },
  { id: 'approvals', icon: 'verified', label: 'Approvals' },
  { id: 'notices', icon: 'campaign', label: 'Notices' },
  { id: 'copilot', icon: 'auto_awesome', label: 'Copilot' },
];

const ADMIN_NAV = [
  { id: 'home', icon: 'grid_view', label: 'Overview', filled: true },
  { id: 'issues', icon: 'warning', label: 'Issues' },
  { id: 'approvals', icon: 'verified', label: 'Approvals' },
  { id: 'plugins', icon: 'extension', label: 'Plugins' },
];

export default function HostShell({ user, token, apiBase, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPlugin, setSelectedPlugin] = useState(null);

  const navItems = user.role === 'admin' ? ADMIN_NAV
    : user.role === 'professor' ? PROFESSOR_NAV
    : STUDENT_NAV;

  const handlePluginClick = useCallback((plugin) => {
    setSelectedPlugin(plugin);
    setActiveTab('iframe');
  }, []);

  const handleBack = useCallback(() => {
    setSelectedPlugin(null);
    setActiveTab('home');
  }, []);

  const apiHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const renderContent = () => {
    if (activeTab === 'iframe' && selectedPlugin) {
      return <IframeContainer plugin={selectedPlugin} user={user} onBack={handleBack} />;
    }

    // Student views
    if (user.role === 'student') {
      switch (activeTab) {
        case 'home': return <StudentDashboard user={user} apiBase={apiBase} headers={apiHeaders} onNavigate={setActiveTab} />;
        case 'calendar': return <CalendarView user={user} apiBase={apiBase} headers={apiHeaders} />;
        case 'karma': return <KarmaView user={user} apiBase={apiBase} headers={apiHeaders} />;
        case 'copilot': return <CopilotChat user={user} apiBase={apiBase} headers={apiHeaders} onClose={() => setActiveTab('home')} />;
        case 'finance': return <FinanceView user={user} apiBase={apiBase} headers={apiHeaders} />;
        case 'pyq': return <PYQView user={user} apiBase={apiBase} headers={apiHeaders} />;
        case 'issues': return <CampusIssueHeatmap user={user} apiBase={apiBase} headers={apiHeaders} onNavigate={setActiveTab} />;
        case 'report-issue': return <ReportIssue user={user} apiBase={apiBase} headers={apiHeaders} onBack={() => setActiveTab('issues')} />;
        case 'apps': return <MiniAppDashboard apiBase={apiBase} onPluginClick={handlePluginClick} />;
        case 'developer': return <DeveloperPortal apiBase={apiBase} />;
        case 'submit-request': return <SubmitRequest user={user} apiBase={apiBase} headers={apiHeaders} onBack={() => setActiveTab('home')} onSubmitted={() => setActiveTab('track-request')} />;
        case 'track-request': return <TrackRequest user={user} apiBase={apiBase} headers={apiHeaders} onBack={() => setActiveTab('home')} />;
        case 'editorial': return <EditorialFeed user={user} apiBase={apiBase} headers={apiHeaders} onBack={() => setActiveTab('home')} />;
        default: return <StudentDashboard user={user} apiBase={apiBase} headers={apiHeaders} onNavigate={setActiveTab} />;
      }
    }

    // Professor views
    if (user.role === 'professor') {
      switch (activeTab) {
        case 'home': return <ProfessorDashboard user={user} apiBase={apiBase} headers={apiHeaders} onNavigate={setActiveTab} />;
        case 'attendance': return <AttendanceView user={user} apiBase={apiBase} headers={apiHeaders} />;
        case 'calendar': return <CalendarView user={user} apiBase={apiBase} headers={apiHeaders} />;
        case 'copilot': return <CopilotChat user={user} apiBase={apiBase} headers={apiHeaders} onClose={() => setActiveTab('home')} />;
        case 'approvals': return <ApprovalsQueue user={user} apiBase={apiBase} headers={apiHeaders} />;
        case 'notices': return <NoticePublisher user={user} apiBase={apiBase} headers={apiHeaders} onBack={() => setActiveTab('home')} />;
        default: return <ProfessorDashboard user={user} apiBase={apiBase} headers={apiHeaders} onNavigate={setActiveTab} />;
      }
    }

    // Admin views
    if (user.role === 'admin') {
      switch (activeTab) {
        case 'home': return <AdminDashboard user={user} apiBase={apiBase} headers={apiHeaders} onNavigate={setActiveTab} />;
        case 'issues': return <CampusIssueHeatmap user={user} apiBase={apiBase} headers={apiHeaders} onNavigate={setActiveTab} />;
        case 'attendance': return <AttendanceView user={user} apiBase={apiBase} headers={apiHeaders} />;
        case 'plugins': return <AdminAuditView apiBase={apiBase} />;
        case 'approvals': return <ApprovalsQueue user={user} apiBase={apiBase} headers={apiHeaders} />;
        default: return <AdminDashboard user={user} apiBase={apiBase} headers={apiHeaders} onNavigate={setActiveTab} />;
      }
    }

    return null;
  };

  return (
    <div className="host-shell">
      {/* Top Bar */}
      <header className="shell-topbar">
        <div className="topbar-left">
          <span className="material-symbols-outlined topbar-icon" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
          <span className="topbar-brand">Aether</span>
        </div>
        <div className="topbar-right">
          <button className="topbar-notif" onClick={() => setActiveTab('editorial')}>
            <span className="material-symbols-outlined">notifications</span>
            <span className="notif-dot" />
          </button>
          <button className="topbar-avatar" onClick={onLogout} title="Logout">
            <span className="avatar-initials">{user.name?.[0] || '?'}</span>
          </button>
        </div>
      </header>

      {/* Content — keyed for page transitions */}
      <main className="shell-content">
        <div className="page-transition" key={activeTab}>
          {renderContent()}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="shell-bottom-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(item.id); setSelectedPlugin(null); }}
          >
            <span
              className="material-symbols-outlined"
              style={activeTab === item.id ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
