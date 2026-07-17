const logger = require('../../utils/logger');
const { NotFoundError } = require('../../errors/AppError');
const userRepository = require('./user.repository');

const DEFAULT_TARGETS = {
  targetCompanies: [],
  placementTimeline: null,
  targetPreparationLevel: null,
};

const DEFAULT_PREFERENCES = {
  preferredLanguage: null,
  preferredDifficulty: null,
  dashboardSettings: {},
};

const formatProfile = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  profilePicture: row.profile_picture_url,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const formatTargets = (row) => {
  if (!row) {
    return { ...DEFAULT_TARGETS };
  }

  return {
    targetCompanies: row.target_companies || [],
    placementTimeline: row.placement_timeline,
    targetPreparationLevel: row.target_preparation_level,
    updatedAt: row.updated_at,
  };
};

const formatPreferences = (row) => {
  if (!row) {
    return { ...DEFAULT_PREFERENCES };
  }

  return {
    preferredLanguage: row.preferred_language,
    preferredDifficulty: row.preferred_difficulty,
    dashboardSettings: row.dashboard_settings || {},
    updatedAt: row.updated_at,
  };
};

const getProfile = async (userId) => {
  const profile = await userRepository.findProfileByUserId(userId);
  if (!profile) {
    throw new NotFoundError('User not found');
  }

  return formatProfile(profile);
};

const updateProfile = async (userId, { name, profilePicture }) => {
  const updated = await userRepository.updateProfile(userId, {
    name,
    profilePictureUrl: profilePicture,
  });

  if (!updated) {
    throw new NotFoundError('User not found');
  }

  logger.info(`User profile updated: ${updated.email}`);

  return formatProfile(updated);
};

const getTargets = async (userId) => {
  const targets = await userRepository.findTargetsByUserId(userId);
  return formatTargets(targets);
};

const updateTargets = async (userId, updates) => {
  const existing = await userRepository.findTargetsByUserId(userId);
  const current = formatTargets(existing);

  const merged = {
    targetCompanies: updates.targetCompanies ?? current.targetCompanies,
    placementTimeline:
      updates.placementTimeline !== undefined
        ? updates.placementTimeline
        : current.placementTimeline,
    targetPreparationLevel:
      updates.targetPreparationLevel !== undefined
        ? updates.targetPreparationLevel
        : current.targetPreparationLevel,
  };

  const saved = await userRepository.upsertTargets(userId, {
    targetCompanies: merged.targetCompanies,
    placementTimeline: merged.placementTimeline,
    targetPreparationLevel: merged.targetPreparationLevel,
  });

  logger.info(`User targets updated: userId=${userId}`);

  return formatTargets(saved);
};

const getPreferences = async (userId) => {
  const preferences = await userRepository.findPreferencesByUserId(userId);
  return formatPreferences(preferences);
};

const updatePreferences = async (userId, updates) => {
  const existing = await userRepository.findPreferencesByUserId(userId);
  const current = formatPreferences(existing);

  const merged = {
    preferredLanguage:
      updates.preferredLanguage !== undefined
        ? updates.preferredLanguage
        : current.preferredLanguage,
    preferredDifficulty:
      updates.preferredDifficulty !== undefined
        ? updates.preferredDifficulty
        : current.preferredDifficulty,
    dashboardSettings: updates.dashboardSettings
      ? { ...current.dashboardSettings, ...updates.dashboardSettings }
      : current.dashboardSettings,
  };

  const saved = await userRepository.upsertPreferences(userId, {
    preferredLanguage: merged.preferredLanguage,
    preferredDifficulty: merged.preferredDifficulty,
    dashboardSettings: merged.dashboardSettings,
  });

  logger.info(`User preferences updated: userId=${userId}`);

  return formatPreferences(saved);
};

module.exports = {
  getProfile,
  updateProfile,
  getTargets,
  updateTargets,
  getPreferences,
  updatePreferences,
};
