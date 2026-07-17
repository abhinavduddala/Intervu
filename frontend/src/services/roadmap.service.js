import api from './api';

export const roadmapService = {
  getRoadmap: async () => {
    const res = await api.get('/roadmap');
    return res.data.data; // Returns { roadmap: { totalQuestions, completedQuestions, inProgressQuestions, completionPercentage, currentQuestion, stages } }
  },
};
