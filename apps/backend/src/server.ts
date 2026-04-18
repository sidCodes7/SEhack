// ──────────────────────────────────────────────
// Aether Backend — Entry Point
// ──────────────────────────────────────────────

import 'dotenv/config';
import http from 'http';
import { app } from './app.js';
import { initWebSocketServer } from './shared/websocket/ws.server.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
initWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`🚀 Aether Backend running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server attached`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
