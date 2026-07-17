const analyticsService = require('./analytics.service');

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await analyticsService.getDashboardStats(userId);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

const getTopicsCompletion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const topics = await analyticsService.getTopicsStats(userId);
    res.status(200).json({
      success: true,
      data: { topics },
    });
  } catch (err) {
    next(err);
  }
};

const getPatternsCompletion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const patterns = await analyticsService.getPatternsStats(userId);
    res.status(200).json({
      success: true,
      data: { patterns },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getTopicsCompletion,
  getPatternsCompletion,
};
