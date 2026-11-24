import api from './api';

export const companyService = {
  getReadiness: async () => {
    const res = await api.get('/company/readiness');
    // Backend returns { companies: [{ company, readiness, strengths, weakTopics, ... }] }.
    // Expose every key spelling the pages read (companyName/readinessScore, company_name/readiness_score).
    const list = res.data.data.companies || res.data.data.readiness || [];
    return list.map((c) => {
      const name = c.company ?? c.companyName ?? c.company_name;
      const score = c.readiness ?? c.readinessScore ?? c.readiness_score ?? 0;
      return {
        ...c,
        company: name,
        companyName: name,
        company_name: name,
        readiness: score,
        readinessScore: score,
        readiness_score: score,
      };
    });
  },
  getDetail: async (companyName) => {
    const res = await api.get(`/company/readiness/${companyName}`);
    return res.data.data;
  },
};
