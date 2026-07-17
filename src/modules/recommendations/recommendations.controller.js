const recommendationsService = require('./recommendations.service');

const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const list = await recommendationsService.getDailyRecommendations(userId);
    res.status(200).json({
      success: true,
      data: { recommendations: list },
    });
  } catch (err) {
    next(err);
  }
};

const getDailyStudyPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const plan = await recommendationsService.getDailyStudyPlan(userId);
    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (err) {
    next(err);
  }
};

const getCompanyRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const companyName = req.params.company;
    const list = await recommendationsService.getCompanyRecommendations(userId, companyName);
    res.status(200).json({
      success: true,
      data: { recommendations: list },
    });
  } catch (err) {
    next(err);
  }
};

const refreshRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const list = await recommendationsService.refreshRecommendations(userId);
    res.status(200).json({
      success: true,
      data: { recommendations: list },
      message: 'Recommendations refreshed successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRecommendations,
  getDailyStudyPlan,
  getCompanyRecommendations,
  refreshRecommendations,
};
