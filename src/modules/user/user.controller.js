const userService = require('./user.service');

const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, profilePicture } = req.body;
    const profile = await userService.updateProfile(req.user.id, { name, profilePicture });

    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (err) {
    next(err);
  }
};

const getTargets = async (req, res, next) => {
  try {
    const targets = await userService.getTargets(req.user.id);

    res.status(200).json({
      success: true,
      data: { targets },
    });
  } catch (err) {
    next(err);
  }
};

const updateTargets = async (req, res, next) => {
  try {
    const { targetCompanies, placementTimeline, targetPreparationLevel } = req.body;
    const targets = await userService.updateTargets(req.user.id, {
      targetCompanies,
      placementTimeline,
      targetPreparationLevel,
    });

    res.status(200).json({
      success: true,
      data: { targets },
    });
  } catch (err) {
    next(err);
  }
};

const getPreferences = async (req, res, next) => {
  try {
    const preferences = await userService.getPreferences(req.user.id);

    res.status(200).json({
      success: true,
      data: { preferences },
    });
  } catch (err) {
    next(err);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const { preferredLanguage, preferredDifficulty, dashboardSettings } = req.body;
    const preferences = await userService.updatePreferences(req.user.id, {
      preferredLanguage,
      preferredDifficulty,
      dashboardSettings,
    });

    res.status(200).json({
      success: true,
      data: { preferences },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getTargets,
  updateTargets,
  getPreferences,
  updatePreferences,
};
