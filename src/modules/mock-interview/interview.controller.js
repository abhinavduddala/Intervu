const service = require('./interview.service');

const handle = (fn, status = 200) => async (req, res, next) => {
  try {
    const data = await fn(req);
    res.status(status).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOptions: handle(async () => service.getOptions()),
  create: handle(async (req) => service.createInterview(req.user.id, req.body), 201),
  list: handle(async (req) => service.listInterviews(req.user.id, req.query)),
  getActive: handle(async (req) => service.getActiveInterview(req.user.id)),
  getStats: handle(async (req) => service.getStats(req.user.id)),
  getById: handle(async (req) => service.getInterview(req.user.id, req.params.id)),
  getStatus: handle(async (req) => service.getStatus(req.user.id, req.params.id)),
  answer: handle(async (req) => service.submitAnswer(req.user.id, req.params.id, req.body)),
  pause: handle(async (req) => service.pauseInterview(req.user.id, req.params.id)),
  resume: handle(async (req) => service.resumeInterview(req.user.id, req.params.id)),
  end: handle(async (req) => service.endInterview(req.user.id, req.params.id, req.body)),
  retryEvaluation: handle(async (req) => service.retryEvaluation(req.user.id, req.params.id)),
  getReport: handle(async (req) => service.getReport(req.user.id, req.params.id)),
  remove: handle(async (req) => service.deleteInterview(req.user.id, req.params.id)),
};
