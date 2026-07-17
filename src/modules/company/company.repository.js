const db = require('../../config/db');

const getTopicWeights = async (companyName) => {
  const result = await db.query(
    `SELECT t.name AS topic_name, w.weight
     FROM company_topic_weights w
     INNER JOIN topics t ON w.topic_id = t.id
     WHERE LOWER(w.company_name) = LOWER($1)`,
    [companyName]
  );
  return result.rows;
};

const findReadiness = async (userId, companyName) => {
  const result = await db.query(
    `SELECT id, user_id, company_name, readiness_score, strengths, weak_topics, last_updated
     FROM company_readiness
     WHERE user_id = $1 AND LOWER(company_name) = LOWER($2)`,
    [userId, companyName]
  );
  return result.rows[0] || null;
};

const findAllReadiness = async (userId) => {
  const result = await db.query(
    `SELECT id, user_id, company_name, readiness_score, strengths, weak_topics, last_updated
     FROM company_readiness
     WHERE user_id = $1
     ORDER BY readiness_score DESC`,
    [userId]
  );
  return result.rows;
};

const saveReadiness = async ({ userId, companyName, score, strengths, weakTopics }) => {
  const result = await db.query(
    `INSERT INTO company_readiness (user_id, company_name, readiness_score, strengths, weak_topics, last_updated)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (user_id, company_name) DO UPDATE SET
       readiness_score = EXCLUDED.readiness_score,
       strengths = EXCLUDED.strengths,
       weak_topics = EXCLUDED.weak_topics,
       last_updated = NOW()
     RETURNING id, user_id, company_name, readiness_score, strengths, weak_topics, last_updated`,
    [
      userId,
      companyName,
      score,
      typeof strengths === 'string' ? strengths : JSON.stringify(strengths),
      typeof weakTopics === 'string' ? weakTopics : JSON.stringify(weakTopics),
    ]
  );
  return result.rows[0];
};

const getCompletedCountByTopic = async (userId) => {
  const result = await db.query(
    `SELECT t.name AS topic_name, COUNT(DISTINCT q.id)::INTEGER AS completed
     FROM user_question_progress uqp
     INNER JOIN questions q ON uqp.question_id = q.id
     INNER JOIN topics t ON q.topic_id = t.id
     WHERE uqp.user_id = $1 AND uqp.status = 'SOLVED'
     GROUP BY t.name`,
    [userId]
  );
  return result.rows;
};

const getCompletedCountByPattern = async (userId) => {
  const result = await db.query(
    `SELECT p.name AS pattern_name, COUNT(DISTINCT q.id)::INTEGER AS completed
     FROM user_question_progress uqp
     INNER JOIN questions q ON uqp.question_id = q.id
     INNER JOIN patterns p ON q.pattern_id = p.id
     WHERE uqp.user_id = $1 AND uqp.status = 'SOLVED'
     GROUP BY p.name`,
    [userId]
  );
  return result.rows;
};

const getSolvedCountByDifficulty = async (userId) => {
  const result = await db.query(
    `SELECT q.difficulty, COUNT(DISTINCT q.id)::INTEGER AS completed
     FROM user_question_progress uqp
     INNER JOIN questions q ON uqp.question_id = q.id
     WHERE uqp.user_id = $1 AND uqp.status = 'SOLVED'
     GROUP BY q.difficulty`,
    [userId]
  );
  return result.rows;
};

const getTopicQuestionsCount = async () => {
  const result = await db.query(
    `SELECT t.name AS topic_name, COUNT(q.id)::INTEGER AS total
     FROM topics t
     LEFT JOIN questions q ON q.topic_id = t.id
     GROUP BY t.name`
  );
  return result.rows;
};

const getPatternQuestionsCount = async () => {
  const result = await db.query(
    `SELECT p.name AS pattern_name, COUNT(q.id)::INTEGER AS total
     FROM patterns p
     LEFT JOIN questions q ON q.pattern_id = p.id
     GROUP BY p.name`
  );
  return result.rows;
};

module.exports = {
  getTopicWeights,
  findReadiness,
  findAllReadiness,
  saveReadiness,
  getCompletedCountByTopic,
  getCompletedCountByPattern,
  getSolvedCountByDifficulty,
  getTopicQuestionsCount,
  getPatternQuestionsCount,
};
