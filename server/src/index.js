import 'dotenv/config';
import './middleware/dnsFix.js';
import express from 'express';
import cors from 'cors';
import { db } from './services/neonDb.js';
import { graph } from './services/neo4jClient.js';

// Route imports
import zonesRouter from './routes/zones.js';
import readingsRouter from './routes/readings.js';
import agentsRouter from './routes/agents.js';
import alertsRouter from './routes/alerts.js';
import chatRouter from './routes/chat.js';
import graphRouter from './routes/graph.js';
import simulationRouter from './routes/simulation.js';
import emailRouter from './routes/email.js';
import reportRouter from './routes/report.js';

// Middleware imports
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Core Middleware ─────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'AquaSentinel API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/zones',      zonesRouter);
app.use('/api/readings',   readingsRouter);
app.use('/api/agents',     agentsRouter);
app.use('/api/alerts',     alertsRouter);
app.use('/api/chat',       chatRouter);
app.use('/api/graph',      graphRouter);
app.use('/api/simulation', simulationRouter);
app.use('/api/email',      emailRouter);
app.use('/api/report',     reportRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🌊 AquaSentinel API running on port ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
async function shutdown() {
  console.log('\n[Server] Shutting down gracefully...');
  server.close(async () => {
    console.log('[Server] Closed out remaining connections.');
    try {
      await db.close();
      console.log('[neonDb] Database connection closed.');
    } catch (err) { console.error('[neonDb] Error closing db:', err); }
    
    try {
      await graph.close();
      console.log('[neo4jClient] Graph connection closed.');
    } catch (err) { console.error('[neo4jClient] Error closing graph:', err); }
    
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('[Server] Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
