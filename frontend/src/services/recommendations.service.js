import api from './api';

export const recommendationsService = {
  getStudyPlan: async () => {
    const res = await api.get('/recommendations/study-plan');
    return res.data.data; // Returns { plan, estimatedTime, recommendations }
  },
  refresh: async () => {
    const res = await api.post('/recommendations/refresh');
    return res.data.data;
  },
  getCompanyRecs: async (companyName) => {
    const res = await api.get(`/recommendations/company/${companyName}`);
    return res.data.data;
  },
};
