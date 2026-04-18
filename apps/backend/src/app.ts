// ──────────────────────────────────────────────
// Aether Backend — Express App Setup
// ──────────────────────────────────────────────
// All routes are pre-wired here so other devs never need to edit this file.
// They only implement their module's controller/service/routes files.

import express from 'express';
import cors from 'cors';
import { loggerMiddleware } from './shared/middleware/logger.middleware.js';
import { errorMiddleware } from './shared/middleware/error.middleware.js';
import { authMiddleware } from './shared/middleware/auth.middleware.js';

// ── Route Imports ──────────────────────────────
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import workflowRoutes from './modules/workflow/workflow.routes.js';
import noticesRoutes from './modules/notices/notices.routes.js';
import copilotRoutes from './modules/copilot/copilot.routes.js';
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import issuesRoutes from './modules/issues/issues.routes.js';
import calendarRoutes from './modules/calendar/calendar.routes.js';
import pyqRoutes from './modules/pyq/pyq.routes.js';
import financeRoutes from './modules/finance/finance.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import karmaRoutes from './modules/karma/karma.routes.js';
import pluginsRoutes from './modules/plugins/plugins.routes.js';

// ── App Setup ──────────────────────────────────
export const app = express();

// Parse CORS origins from env
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8081')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// ── Health Check ───────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// ── Route Registration ─────────────────────────
// Auth (public — no authMiddleware)
app.use('/api/auth', authRoutes);

// Protected routes (require valid JWT)
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/workflow', authMiddleware, workflowRoutes);
app.use('/api/notices', authMiddleware, noticesRoutes);
app.use('/api/copilot', authMiddleware, copilotRoutes);
app.use('/api/attendance', authMiddleware, attendanceRoutes);
app.use('/api/issues', authMiddleware, issuesRoutes);
app.use('/api/calendar', authMiddleware, calendarRoutes);
app.use('/api/pyq', authMiddleware, pyqRoutes);
app.use('/api/finance', authMiddleware, financeRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/karma', authMiddleware, karmaRoutes);
app.use('/api/plugins', authMiddleware, pluginsRoutes);

// ── Global Error Handler (must be LAST) ────────
app.use(errorMiddleware);
