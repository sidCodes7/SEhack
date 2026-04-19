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

// Parse CORS origins from env (default includes Vite dev server)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8081,http://localhost:5173,http://localhost:3001')
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

// Finance checkout page (public — opened in device browser for Razorpay)
app.get('/pay/checkout/:amount/:label', (req, res) => {
  const amount = parseInt(req.params.amount) || 250;
  const label = decodeURIComponent(req.params.label || 'Campus Due');
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_Sf3ZtDFK8y8SSU';
  res.send(`<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aether Payment</title>
<style>
*{margin:0;box-sizing:border-box}
body{font-family:-apple-system,system-ui,sans-serif;background:#F7F6F2;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px}
.card{background:#fff;border-radius:24px;padding:32px;width:100%;max-width:400px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.08)}
h1{font-size:28px;font-weight:800;color:#1A1A1A;margin-bottom:4px}
.amount{font-size:48px;font-weight:900;color:#1A1A1A;margin:16px 0}
.label{font-size:14px;color:#6B6B6B;margin-bottom:24px}
.pay-btn{width:100%;padding:16px;background:#1A1A1A;color:#fff;border:none;border-radius:16px;font-size:16px;font-weight:700;cursor:pointer}
.badge{margin-top:16px;font-size:11px;color:#6B6B6B;display:flex;align-items:center;justify-content:center;gap:4px}
.success{display:none}.success.show{display:block}
.success h2{color:#2CB67D;font-size:24px;margin-bottom:8px}
</style>
<script src="https://checkout.razorpay.com/v1/checkout.js"><\/script>
</head><body>
<div class="card">
<h1>Aether Campus OS</h1>
<div class="amount">\u20B9${amount}</div>
<p class="label">${label}</p>
<div id="main"><button class="pay-btn" onclick="startPay()">Pay with Razorpay</button></div>
<div class="success" id="success"><h2>\u2713 Payment Successful</h2><p style="color:#6B6B6B">You can close this tab now</p></div>
<div class="badge">\uD83D\uDD12 Payments secured via Razorpay \u00B7 TEST MODE</div>
</div>
<script>
function startPay(){var o={key:'${keyId}',amount:${amount*100},currency:'INR',name:'Aether Campus OS',description:'${label}',prefill:{name:'Student',email:'student@spit.ac.in'},theme:{color:'#1A1A1A'},handler:function(){document.getElementById('main').style.display='none';document.getElementById('success').classList.add('show')}};new Razorpay(o).open()}
<\/script>
</body></html>`);
});
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/karma', authMiddleware, karmaRoutes);
app.use('/api/plugins', pluginsRoutes); // Plugin list is semi-public; submit uses middleware internally

// ── Global Error Handler (must be LAST) ────────
app.use(errorMiddleware);
