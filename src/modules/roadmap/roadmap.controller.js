const roadmapService = require('./roadmap.service');

const getRoadmap = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await roadmapService.getRoadmap(userId);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRoadmap,
};
