import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';

export function useWebSocket() {
  const { token } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const wsUrl = process.env.EXPO_PUBLIC_WS_URL || 'http://localhost:3000';
    const socketInstance = io(wsUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      auth: { token },
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return { socket };
}
