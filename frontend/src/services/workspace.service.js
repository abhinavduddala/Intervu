import api from './api';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const workspaceService = {
  getProblem: async (questionId, { refresh = false } = {}) => {
    // First load generates the problem with AI, which can take a while
    const res = await api.get(`/workspace/questions/${questionId}/problem`, {
      params: refresh ? { refresh: 'true' } : undefined,
      timeout: 200000,
    });
    return res.data.data.problem;
  },

  /** Run against the sample tests, or against `customInput` when it is a string. */
  run: async ({ questionId, language, sourceCode, customInput }) => {
    const res = await api.post(
      '/workspace/run',
      { questionId, language, sourceCode, ...(typeof customInput === 'string' ? { customInput } : {}) },
      { timeout: 200000 }
    );
    return res.data.data.run;
  },

  /** Submit against every test case and wait for the verdict. */
  submit: async ({ questionId, language, sourceCode }, { onStatus } = {}) => {
    const res = await api.post('/workspace/submit', { questionId, language, sourceCode });
    const { submissionId } = res.data.data;

    for (let attempt = 0; attempt < 90; attempt++) {
      await sleep(1500);
      const statusRes = await api.get(`/submissions/${submissionId}/status`);
      const s = statusRes.data.data;
      onStatus?.(s.statusDescription);
      if (s.statusId && s.statusId >= 3) {
        return { submissionId, ...s };
      }
    }
    throw new Error('Submission is still running. Check your submission history in a moment.');
  },

  getHint: async ({ questionId, language, code, level, previousHints }) => {
    const res = await api.post('/ai/hint', { questionId, language, code, level, previousHints }, { timeout: 90000 });
    return res.data.data.hint;
  },

  getQuestionAnalyses: async (questionId) => {
    const res = await api.get(`/ai/questions/${questionId}/history`);
    return res.data.data.history;
  },
};
