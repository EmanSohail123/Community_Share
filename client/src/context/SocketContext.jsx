import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import { messagesAPI } from '../api/messages.js';

const SocketContext = createContext(null);
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token || !user?.id) { setSocket(null); setUnreadCount(0); return undefined; }
    const connection = io(SOCKET_URL, { auth: { token } });
    connection.on('connect', () => connection.emit('join', user.id));
    connection.on('newMessage', (message) => {
      if (message.receiverId?.toString() === user.id?.toString()) setUnreadCount((count) => count + 1);
    });
    connection.on('unreadCountUpdated', ({ count }) => setUnreadCount(count));
    messagesAPI.getUnreadCount().then(({ count }) => setUnreadCount(count)).catch(() => {});
    setSocket(connection);
    return () => connection.disconnect();
  }, [token, user?.id]);

  const clearUnread = useCallback(() => setUnreadCount(0), []);
  const setUnread = useCallback((count) => setUnreadCount(count), []);
  return <SocketContext.Provider value={{ socket, unreadCount, clearUnread, setUnread }}>{children}</SocketContext.Provider>;
}

export function useSocket() { return useContext(SocketContext); }