const db = require('../../config/db');

const RECOMMENDATION_SELECT = `
  r.id,
  r.user_id,
  r.question_id,
  r.recommendation_type,
  r.priority,
  r.score,
  r.reason,
  r.generated_at,
  r.expires_at,
  r.completed,
  q.title AS question_title,
  q.difficulty AS question_difficulty,
  t.name AS topic_name,
  p.name AS pattern_name
`;

const RECOMMENDATION_FROM = `
  FROM recommendations r
  INNER JOIN questions q ON r.question_id = q.id
  INNER JOIN topics t ON q.topic_id = t.id
  INNER JOIN patterns p ON q.pattern_id = p.id
`;

const create = async ({
  userId,
  questionId,
  recommendationType,
  priority,
  score,
  reason,
  expiresAt,
}) => {
  const result = await db.query(
    `INSERT INTO recommendations (
      user_id,
      question_id,
      recommendation_type,
      priority,
      score,
      reason,
      expires_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, NOW() + INTERVAL '24 hours'))
     RETURNING id`,
    [userId, questionId, recommendationType, priority, score, reason, expiresAt || null]
  );
  
  return findById(result.rows[0].id);
};

const findById = async (id) => {
  const result = await db.query(
    `SELECT ${RECOMMENDATION_SELECT}
     ${RECOMMENDATION_FROM}
     WHERE r.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const findActiveRecommendations = async (userId) => {
  const result = await db.query(
    `SELECT ${RECOMMENDATION_SELECT}
     ${RECOMMENDATION_FROM}
     WHERE r.user_id = $1 AND r.completed = FALSE AND r.expires_at > NOW()
     ORDER BY r.priority ASC, r.score DESC`,
    [userId]
  );
  return result.rows;
};

const markAsCompleted = async (userId, questionId) => {
  const result = await db.query(
    `UPDATE recommendations
     SET completed = TRUE
     WHERE user_id = $1 AND question_id = $2 AND completed = FALSE AND expires_at > NOW()
     RETURNING id`,
    [userId, questionId]
  );
  return result.rows;
};

const clearActiveRecommendations = async (userId) => {
  await db.query(
    `DELETE FROM recommendations
     WHERE user_id = $1 AND completed = FALSE AND expires_at > NOW()`,
    [userId]
  );
};

const getUnsolvedQuestionsInTopics = async (userId, topicNames) => {
  const result = await db.query(
    `SELECT q.id, q.title, q.difficulty, t.name AS topic_name, p.name AS pattern_name
     FROM questions q
     INNER JOIN topics t ON q.topic_id = t.id
     INNER JOIN patterns p ON q.pattern_id = p.id
     WHERE LOWER(t.name) = ANY($2::TEXT[])
       AND q.id NOT IN (
         SELECT question_id FROM user_question_progress WHERE user_id = $1 AND status = 'SOLVED'
       )
     ORDER BY q.id ASC`,
    [userId, topicNames.map((n) => n.toLowerCase())]
  );
  return result.rows;
};

const getUnsolvedQuestionsInPatterns = async (userId, patternNames) => {
  const result = await db.query(
    `SELECT q.id, q.title, q.difficulty, t.name AS topic_name, p.name AS pattern_name
     FROM questions q
     INNER JOIN topics t ON q.topic_id = t.id
     INNER JOIN patterns p ON q.pattern_id = p.id
     WHERE LOWER(p.name) = ANY($2::TEXT[])
       AND q.id NOT IN (
         SELECT question_id FROM user_question_progress WHERE user_id = $1 AND status = 'SOLVED'
       )
     ORDER BY q.id ASC`,
    [userId, patternNames.map((n) => n.toLowerCase())]
  );
  return result.rows;
};

const getRevisionCandidates = async (userId) => {
  // Finds questions solved by the user, ordered by the last solved date ascending (spaced repetition candidate)
  const result = await db.query(
    `SELECT DISTINCT q.id, q.title, q.difficulty, t.name AS topic_name, p.name AS pattern_name, uqp.completed_at AS last_solved_at
     FROM questions q
     INNER JOIN topics t ON q.topic_id = t.id
     INNER JOIN patterns p ON q.pattern_id = p.id
     INNER JOIN user_question_progress uqp ON uqp.question_id = q.id
     WHERE uqp.user_id = $1 AND uqp.status = 'SOLVED'
     ORDER BY last_solved_at ASC
     LIMIT 10`,
    [userId]
  );
  return result.rows;
};

const getQuestionsStruggledWith = async (userId) => {
  // Finds questions the user has solved, but took more than 2 code pastes (submissions) or has revision needs
  const result = await db.query(
    `SELECT DISTINCT q.id, q.title, q.difficulty, t.name AS topic_name, p.name AS pattern_name, COUNT(s.id) AS attempt_count
     FROM questions q
     INNER JOIN topics t ON q.topic_id = t.id
     INNER JOIN patterns p ON q.pattern_id = p.id
     INNER JOIN submissions s ON s.question_id = q.id
     INNER JOIN user_question_progress uqp ON uqp.question_id = q.id
     WHERE s.user_id = $1 AND uqp.user_id = $1 AND uqp.status = 'SOLVED'
     GROUP BY q.id, q.title, q.difficulty, t.name, p.name
     HAVING COUNT(s.id) > 2
     LIMIT 5`,
    [userId]
  );
  return result.rows;
};

module.exports = {
  create,
  findById,
  findActiveRecommendations,
  markAsCompleted,
  clearActiveRecommendations,
  getUnsolvedQuestionsInTopics,
  getUnsolvedQuestionsInPatterns,
  getRevisionCandidates,
  getQuestionsStruggledWith,
};
