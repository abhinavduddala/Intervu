import api from './api';

export const analyticsService = {
  getStats: async () => {
    const res = await api.get('/analytics/dashboard');
    return res.data.data;
  },
  getTopics: async () => {
    const res = await api.get('/analytics/topics');
    return res.data.data.topics;
  },
  getPatterns: async () => {
    const res = await api.get('/analytics/patterns');
    return res.data.data.patterns;
  },
};
