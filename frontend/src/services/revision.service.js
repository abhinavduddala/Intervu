import api from './api';

export const revisionService = {
  getToday: async () => {
    const res = await api.get('/revision/today');
    return res.data.data.revisions;
  },
  getUpcoming: async () => {
    const res = await api.get('/revision/upcoming');
    return res.data.data.revisions;
  },
  complete: async (questionId) => {
    const res = await api.post(`/revision/${questionId}/complete`);
    return res.data.data.revision;
  },
  reset: async (questionId) => {
    const res = await api.post(`/revision/${questionId}/reset`);
    return res.data.data.revision;
  },
  getDashboard: async () => {
    const res = await api.get('/revision/dashboard');
    return res.data.data; // Returns { todayCount, overdueCount, upcomingCount, calendar }
  },
};
