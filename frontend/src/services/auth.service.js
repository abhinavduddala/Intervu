import api from './api';

export const authService = {
  login: async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data; // Returns { user, token }
  },

  register: async ({ email, password, role = 'user' }) => {
    const res = await api.post('/auth/register', { email, password, role });
    return res.data.data; // Returns { user, token }
  },

  logout: async () => {
    // Discard cookies/headers on frontend client side
    return { success: true };
  },

  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data.data; // Returns user profile details
  },
};
