// ──────────────────────────────────────────────
// Socket.IO Server Setup
// ──────────────────────────────────────────────

import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';

let io: SocketIOServer;

/**
 * Initialize Socket.IO server and attach to HTTP server.
 * Call once from server.ts.
 */
export function initWebSocketServer(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:8081')
        .split(',')
        .map((o) => o.trim()),
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Client joins their personal room for targeted events
    socket.on('join:user', ({ userId, role }: { userId: string; role: string }) => {
      socket.join(`user:${userId}`);
      socket.join(`role:${role}`);
      console.log(`👤 User ${userId} (${role}) joined personal room`);
    });

    // Client subscribes to a specific request's approval updates
    socket.on('join:room', ({ requestId }: { requestId: string }) => {
      socket.join(`request:${requestId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Get the Socket.IO server instance.
 * Throws if called before initWebSocketServer().
 */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized — call initWebSocketServer() first');
  }
  return io;
}

/**
 * Emit an event to a specific user by their ID.
 */
export function emitToUser(userId: string, event: string, payload: unknown): void {
  getIO().to(`user:${userId}`).emit(event, payload);
}

/**
 * Emit an event to all users with a specific role.
 */
export function emitToRole(role: string, event: string, payload: unknown): void {
  getIO().to(`role:${role}`).emit(event, payload);
}

/**
 * Emit an event to a specific room (e.g., request:uuid for approval tracking).
 */
export function emitToRoom(room: string, event: string, payload: unknown): void {
  getIO().to(room).emit(event, payload);
}
