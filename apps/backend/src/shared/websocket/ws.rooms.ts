// ──────────────────────────────────────────────
// WebSocket Room Management
// ──────────────────────────────────────────────

import { getIO } from './ws.server.js';

/**
 * Add a socket to a room by socket ID.
 */
export async function joinRoom(socketId: string, room: string): Promise<void> {
  const io = getIO();
  const socket = io.sockets.sockets.get(socketId);
  if (socket) {
    socket.join(room);
  }
}

/**
 * Remove a socket from a room by socket ID.
 */
export async function leaveRoom(socketId: string, room: string): Promise<void> {
  const io = getIO();
  const socket = io.sockets.sockets.get(socketId);
  if (socket) {
    socket.leave(room);
  }
}

/**
 * Get all socket IDs currently in a room.
 */
export async function getRoomMembers(room: string): Promise<string[]> {
  const io = getIO();
  const sockets = await io.in(room).fetchSockets();
  return sockets.map((s) => s.id);
}
