const revisionService = require('./revision.service');

const getTodayRevisions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const list = await revisionService.getTodayRevisions(userId);
    res.status(200).json({
      success: true,
      data: { revisions: list },
    });
  } catch (err) {
    next(err);
  }
};

const getUpcomingRevisions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const list = await revisionService.getUpcomingRevisions(userId);
    res.status(200).json({
      success: true,
      data: { revisions: list },
    });
  } catch (err) {
    next(err);
  }
};

const completeRevision = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const questionId = Number(req.params.questionId);
    const updated = await revisionService.completeRevision(userId, questionId);
    res.status(200).json({
      success: true,
      data: { revision: updated },
      message: 'Revision marked as completed successfully',
    });
  } catch (err) {
    next(err);
  }
};

const resetRevision = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const questionId = Number(req.params.questionId);
    const updated = await revisionService.resetRevision(userId, questionId);
    res.status(200).json({
      success: true,
      data: { revision: updated },
      message: 'Revision schedule reset successfully',
    });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await revisionService.getDashboardIntegration(userId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTodayRevisions,
  getUpcomingRevisions,
  completeRevision,
  resetRevision,
  getDashboardStats,
};
