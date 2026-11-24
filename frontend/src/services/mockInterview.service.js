import api from './api';

// Interviewer turns and interview creation wait on the AI, which can take a while
const AI_TIMEOUT = 150000;

export const mockInterviewService = {
  getOptions: async () => (await api.get('/mock-interviews/options')).data.data,

  create: async (config) => (await api.post('/mock-interviews', config, { timeout: AI_TIMEOUT })).data.data,

  list: async ({ page = 1, limit = 10 } = {}) =>
    (await api.get('/mock-interviews', { params: { page, limit } })).data.data,

  getActive: async () => (await api.get('/mock-interviews/active')).data.data.interview,

  getStats: async () => (await api.get('/mock-interviews/stats')).data.data,

  get: async (id) => (await api.get(`/mock-interviews/${id}`)).data.data,

  getStatus: async (id) => (await api.get(`/mock-interviews/${id}/status`)).data.data,

  answer: async (id, { answer, clientMessageId, inputMode }) =>
    (await api.post(`/mock-interviews/${id}/answer`, { answer, clientMessageId, inputMode }, { timeout: AI_TIMEOUT }))
      .data.data,

  pause: async (id) => (await api.post(`/mock-interviews/${id}/pause`)).data.data.interview,

  resume: async (id) => (await api.post(`/mock-interviews/${id}/resume`)).data.data.interview,

  end: async (id, reason = 'user_ended') => (await api.post(`/mock-interviews/${id}/end`, { reason })).data.data,

  retryEvaluation: async (id) => (await api.post(`/mock-interviews/${id}/evaluation/retry`)).data.data,

  getReport: async (id) => (await api.get(`/mock-interviews/${id}/report`)).data.data,

  remove: async (id) => (await api.delete(`/mock-interviews/${id}`)).data.data,
};

/** Random UUID for idempotent answer submission, with a fallback for older browsers. */
export const newClientMessageId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};
