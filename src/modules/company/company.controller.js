const companyService = require('./company.service');

const getReadiness = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const readiness = await companyService.getCompanyReadiness(userId);
    res.status(200).json({
      success: true,
      data: { companies: readiness },
    });
  } catch (err) {
    next(err);
  }
};

const getReadinessDetail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const companyName = req.params.company;
    const detail = await companyService.getCompanyReadinessDetail(userId, companyName);
    res.status(200).json({
      success: true,
      data: detail,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getReadiness,
  getReadinessDetail,
};
