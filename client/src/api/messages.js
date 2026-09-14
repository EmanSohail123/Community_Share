import api from './listings.js';

export const messagesAPI = {
  openConversation: async (payload) => (await api.post('/conversations', payload)).data,
  getConversations: async () => (await api.get('/conversations')).data,
  getMessages: async (conversationId) => (await api.get(`/messages/${conversationId}`)).data,
  markRead: async (conversationId) => (await api.patch(`/messages/${conversationId}/read`)).data,
  send: async (payload) => (await api.post('/messages', payload)).data,
  getUnreadCount: async () => (await api.get('/messages/unread/count')).data,
};