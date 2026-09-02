import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('communityshare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Listings API functions
export const listingsAPI = {
  // Create a new listing with image upload
  create: async (formData) => {
    const response = await api.post('/listings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get all listings with optional filters
  getAll: async (params = {}) => {
    const response = await api.get('/listings', { params });
    return response.data;
  },

  // Get a single listing by ID
  getById: async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },

  // Get all listings by the current user
  getMyListings: async () => {
    const response = await api.get('/listings/user/mylistings');
    return response.data;
  },

  // Update a listing (with optional image upload)
  update: async (id, formData) => {
    const response = await api.put(`/listings/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete a listing
  delete: async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },
};

export default api;
