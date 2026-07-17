import api from './api';

export const companyService = {
  getReadiness: async () => {
    const res = await api.get('/company/readiness');
    return res.data.data.readiness; // Returns readiness array
  },
  getDetail: async (companyName) => {
    const res = await api.get(`/company/readiness/${companyName}`);
    return res.data.data;
  },
};
