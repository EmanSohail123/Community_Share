import api from './listings.js';

export const reviewsAPI = {
  getForUser: async (userId) => (await api.get(`/reviews/user/${userId}`)).data,
  create: async (payload) => (await api.post('/reviews', payload)).data,
};
