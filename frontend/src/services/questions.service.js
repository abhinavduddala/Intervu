import api from './api';

export const questionsService = {
  get: async (filters = {}) => {
    // Clean out empty strings, null, and undefined values to avoid backend Zod validation errors
    const cleanedFilters = {};
    Object.keys(filters).forEach(key => {
      const val = filters[key];
      if (val !== undefined && val !== null && val !== '') {
        cleanedFilters[key] = val;
      }
    });
    const res = await api.get('/questions', { params: cleanedFilters });
    return res.data.data; // Returns { questions, pagination }
  },

  getById: async (id) => {
    const res = await api.get(`/questions/${id}`);
    return res.data.data.question;
  },

  start: async (id) => {
    const res = await api.post(`/questions/${id}/start`);
    return res.data.data.progress;
  },

  markSolved: async (id, leetcodeSubmissionUrl = null) => {
    const res = await api.post(`/questions/${id}/mark-solved`, { leetcodeSubmissionUrl });
    return res.data.data.progress;
  },

  favorite: async (id) => {
    const res = await api.post(`/questions/${id}/favorite`);
    return res.data.data.progress;
  },

  saveNotes: async (id, notes) => {
    const res = await api.post(`/questions/${id}/notes`, { notes });
    return res.data.data.progress;
  },

  pasteSolution: async (id, { sourceCode, language }) => {
    const res = await api.post('/ai/analyze', {
      questionId: id,
      language,
      code: sourceCode
    });
    
    const analysis = res.data.data.analysis;
    if (analysis && analysis.status === 'completed') {
      return { analysis };
    }

    const analysisId = analysis.id;
    const maxAttempts = 25;
    const pollInterval = 1500;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const pollRes = await api.get(`/ai/history/${analysisId}`);
      const updatedAnalysis = pollRes.data.data.analysis;

      if (updatedAnalysis && updatedAnalysis.status === 'completed') {
        return { analysis: updatedAnalysis };
      }
      
      if (updatedAnalysis && updatedAnalysis.status === 'failed') {
        throw new Error('AI Complexity Review failed on background server. Verify code syntax.');
      }
    }

    throw new Error('AI Complexity Review timed out. Please check your history widget.');
  },

  getProgress: async () => {
    const res = await api.get('/questions/progress');
    return res.data.data.progress; // Returns list of progress records
  },

  getTopics: async () => {
    const res = await api.get('/questions/topics');
    return res.data.data.topics;
  },

  getPatterns: async () => {
    const res = await api.get('/questions/patterns');
    return res.data.data.patterns;
  },
};
