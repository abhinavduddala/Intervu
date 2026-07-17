import api from './api';

export const adminService = {
  // Question curation
  createQuestion: async (questionData) => {
    const res = await api.post('/questions', questionData);
    return res.data.data.question;
  },

  updateQuestion: async (id, questionData) => {
    const res = await api.put(`/questions/${id}`, questionData);
    return res.data.data.question;
  },

  deleteQuestion: async (id) => {
    const res = await api.delete(`/questions/${id}`);
    return res.data;
  },

  // Category management
  createTopic: async (name) => {
    const res = await api.post('/topics', { name });
    return res.data.data.topic;
  },

  createPattern: async (name) => {
    const res = await api.post('/patterns', { name });
    return res.data.data.pattern;
  },

  // Dataset Import
  importQuestions: async (questionsArray) => {
    const res = await api.post('/admin/import/questions', questionsArray);
    return res.data.data; // Returns { inserted, duplicates, failed }
  }
};
