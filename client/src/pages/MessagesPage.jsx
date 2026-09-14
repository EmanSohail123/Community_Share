import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { messagesAPI } from '../api/messages.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket, setUnread } = useSocket();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const activeId = conversationId || null;

  useEffect(() => { messagesAPI.getConversations().then(setConversations).catch((err) => setError(err.message)); }, []);

  useEffect(() => {
    if (!conversations.length || searchParams.get('receiver') || activeId) return;
    navigate(`/messages/${conversations[0]._id}`, { replace: true });
  }, [conversations, activeId, searchParams, navigate]);

  useEffect(() => {
    const receiverId = searchParams.get('receiver');
    if (!receiverId) return;
    messagesAPI.openConversation({ receiverId, listingId: searchParams.get('listing') }).then(async ({ conversationId }) => {
      const updatedConversations = await messagesAPI.getConversations();
      setConversations(updatedConversations);
      navigate(`/messages/${conversationId}`, { replace: true });
    }).catch((err) => setError(err.message));
  }, [searchParams, navigate]);
  useEffect(() => {
    if (!activeId) return undefined;
    setConversations((current) => current.map((conversation) => (
      conversation._id === activeId
        ? { ...conversation, unreadCount: 0 }
        : conversation
    )));
    Promise.all([messagesAPI.markRead(activeId), messagesAPI.getMessages(activeId)]).then(([readResult, items]) => {
      setMessages(items);
      setUnread(readResult.unreadCount);
    }).catch((err) => setError(err.message));
  }, [activeId, setUnread]);
  useEffect(() => {
    if (!socket) return undefined;
    const handleMessage = (message) => {
      if (message.conversationId?.toString() === activeId?.toString()) setMessages((current) => [...current, message]);
      messagesAPI.getConversations().then(setConversations).catch(() => {});
    };
    socket.on('newMessage', handleMessage);
    return () => socket.off('newMessage', handleMessage);
  }, [socket, activeId]);

  const active = conversations.find((conversation) => conversation._id === activeId);
  const other = active?.participants.find((participant) => participant._id !== user?.id);

  async function sendMessage(event) {
    event.preventDefault();
    if (!draft.trim() || !other) return;
    const payload = { receiverId: other._id, conversationId: activeId, content: draft };
    if (socket?.connected) socket.emit('sendMessage', payload, (result) => { if (result?.error) setError(result.error); });
    else {
      const result = await messagesAPI.send(payload);
      setMessages((current) => [...current, result.message]);
      messagesAPI.getConversations().then(setConversations).catch(() => {});
    }
    setDraft('');
  }

  return <main className="page-shell"><section className="messages-page"><div className="messages-heading"><p className="eyebrow">Your conversations</p><h1>Stay in touch.</h1></div>{error && <p className="form-error">{error}</p>}<div className="chat-layout"><aside className="conversation-list">{conversations.length === 0 ? <p className="empty-copy">No conversations yet.</p> : conversations.map((conversation) => { const participant = conversation.participants.find((item) => item._id !== user?.id); return <button className={`conversation-item ${activeId === conversation._id ? 'active' : ''}`} key={conversation._id} onClick={() => navigate(`/messages/${conversation._id}`)}><span className="avatar">{participant?.name?.charAt(0)}</span><span><strong>{participant?.name || 'Neighbor'}</strong><small>{conversation.lastMessage || 'Start a conversation'}</small></span>{conversation.unreadCount > 0 && <b className="unread-badge">{conversation.unreadCount}</b>}</button>; })}</aside><section className="chat-thread">{!active ? <div className="chat-empty"><span className="empty-icon">↗</span><h2>Choose a conversation</h2><p>Select a neighbor to see your messages.</p></div> : <><header className="chat-header"><strong>{other?.name}</strong><small>{other?.email}</small></header><div className="message-list">{messages.map((message) => <div className={`message-bubble ${message.senderId?._id === user?.id ? 'mine' : ''}`} key={message._id}><p>{message.content}</p><small>{new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small></div>)}</div><form className="message-form" onSubmit={sendMessage}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message..." /><button className="button button-coral">Send ↗</button></form></>}</section></div></section></main>;
}
