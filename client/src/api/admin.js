import api from './listings.js';

export const adminAPI = {
  getUsers: async () => (await api.get('/admin/users')).data,
  getListings: async () => (await api.get('/admin/listings')).data,
  deleteUser: async (id) => (await api.delete(`/admin/users/${id}`)).data,
  deleteListing: async (id) => (await api.delete(`/admin/listings/${id}`)).data,
};
