const db = require('../../config/db');

const findProfileByUserId = async (userId) => {
  const result = await db.query(
    `SELECT id, email, role, name, profile_picture_url, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

const updateProfile = async (userId, { name, profilePictureUrl }) => {
  const fields = [];
  const values = [userId];
  let paramIndex = 2;

  if (name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(name);
  }

  if (profilePictureUrl !== undefined) {
    fields.push(`profile_picture_url = $${paramIndex++}`);
    values.push(profilePictureUrl);
  }

  if (fields.length === 0) {
    return findProfileByUserId(userId);
  }

  fields.push('updated_at = NOW()');

  const result = await db.query(
    `UPDATE users
     SET ${fields.join(', ')}
     WHERE id = $1
     RETURNING id, email, role, name, profile_picture_url, created_at, updated_at`,
    values
  );
  return result.rows[0] || null;
};

const findTargetsByUserId = async (userId) => {
  const result = await db.query(
    `SELECT user_id, target_companies, placement_timeline, target_preparation_level, created_at, updated_at
     FROM user_targets
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

const upsertTargets = async (userId, { targetCompanies, placementTimeline, targetPreparationLevel }) => {
  const result = await db.query(
    `INSERT INTO user_targets (user_id, target_companies, placement_timeline, target_preparation_level)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET
       target_companies = EXCLUDED.target_companies,
       placement_timeline = EXCLUDED.placement_timeline,
       target_preparation_level = EXCLUDED.target_preparation_level,
       updated_at = NOW()
     RETURNING user_id, target_companies, placement_timeline, target_preparation_level, created_at, updated_at`,
    [userId, targetCompanies, placementTimeline, targetPreparationLevel]
  );
  return result.rows[0];
};

const findPreferencesByUserId = async (userId) => {
  const result = await db.query(
    `SELECT user_id, preferred_language, preferred_difficulty, dashboard_settings, created_at, updated_at
     FROM user_preferences
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

const upsertPreferences = async (userId, { preferredLanguage, preferredDifficulty, dashboardSettings }) => {
  const result = await db.query(
    `INSERT INTO user_preferences (user_id, preferred_language, preferred_difficulty, dashboard_settings)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET
       preferred_language = EXCLUDED.preferred_language,
       preferred_difficulty = EXCLUDED.preferred_difficulty,
       dashboard_settings = EXCLUDED.dashboard_settings,
       updated_at = NOW()
     RETURNING user_id, preferred_language, preferred_difficulty, dashboard_settings, created_at, updated_at`,
    [userId, preferredLanguage, preferredDifficulty, JSON.stringify(dashboardSettings)]
  );
  return result.rows[0];
};

module.exports = {
  findProfileByUserId,
  updateProfile,
  findTargetsByUserId,
  upsertTargets,
  findPreferencesByUserId,
  upsertPreferences,
};
