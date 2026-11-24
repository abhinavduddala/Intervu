const db = require('../../config/db');

const getOverallMetrics = async (userId) => {
  const result = await db.query(
    `SELECT 
       COUNT(CASE WHEN status != 'NOT_STARTED' THEN 1 END)::INTEGER AS total_attempts,
       COUNT(CASE WHEN status = 'SOLVED' THEN 1 END)::INTEGER AS accepted_attempts,
       COUNT(DISTINCT question_id)::INTEGER AS unique_attempted,
       COUNT(DISTINCT CASE WHEN status = 'SOLVED' THEN question_id END)::INTEGER AS unique_solved,
       0.0::NUMERIC AS avg_time,
       0::NUMERIC AS avg_memory
     FROM user_question_progress
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
};

const getAverageAIRating = async (userId) => {
  const result = await db.query(
    // Gemini reviews are stored in ai_analyses (0-100 confidence score); scale to the 0-10 rating used by readiness.
    `SELECT COALESCE(AVG((analysis_result->>'confidenceScore')::NUMERIC / 10), 0)::NUMERIC AS avg_ai_rating
     FROM ai_analyses
     WHERE user_id = $1
       AND status = 'completed'
       AND analysis_result ? 'confidenceScore'`,
    [userId]
  );
  return parseFloat(result.rows[0].avg_ai_rating);
};

const getSubmissionDates = async (userId) => {
  const result = await db.query(
    `SELECT DISTINCT DATE_TRUNC('day', COALESCE(completed_at, started_at) AT TIME ZONE 'UTC') AS submit_date
     FROM user_question_progress
     WHERE user_id = $1 AND status = 'SOLVED'
     ORDER BY submit_date DESC`,
    [userId]
  );
  return result.rows.map((row) => new Date(row.submit_date));
};

const getTopicsCompletion = async (userId) => {
  const result = await db.query(
    `SELECT 
       t.id AS topic_id,
       t.name AS topic_name,
       COUNT(DISTINCT q.id)::INTEGER AS total_questions,
       COUNT(DISTINCT CASE WHEN uqp.status = 'SOLVED' THEN q.id END)::INTEGER AS completed_questions
     FROM topics t
     LEFT JOIN questions q ON q.topic_id = t.id
     LEFT JOIN user_question_progress uqp ON uqp.question_id = q.id AND uqp.user_id = $1
     GROUP BY t.id, t.name
     ORDER BY t.name ASC`,
    [userId]
  );
  return result.rows;
};

const getPatternsCompletion = async (userId) => {
  const result = await db.query(
    `SELECT 
       p.id AS pattern_id,
       p.name AS pattern_name,
       COUNT(DISTINCT q.id)::INTEGER AS total_questions,
       COUNT(DISTINCT CASE WHEN uqp.status = 'SOLVED' THEN q.id END)::INTEGER AS completed_questions
     FROM patterns p
     LEFT JOIN questions q ON q.pattern_id = p.id
     LEFT JOIN user_question_progress uqp ON uqp.question_id = q.id AND uqp.user_id = $1
     GROUP BY p.id, p.name
     ORDER BY p.name ASC`,
    [userId]
  );
  return result.rows;
};

const getDifficultyDistribution = async (userId) => {
  const result = await db.query(
    `SELECT 
       q.difficulty,
       COUNT(DISTINCT q.id)::INTEGER AS total_questions,
       COUNT(DISTINCT CASE WHEN uqp.status = 'SOLVED' THEN q.id END)::INTEGER AS completed_questions
     FROM questions q
     LEFT JOIN user_question_progress uqp ON uqp.question_id = q.id AND uqp.user_id = $1
     GROUP BY q.difficulty`,
    [userId]
  );
  return result.rows;
};

const getActivityGraph = async (userId, interval, limit = 30) => {
  const result = await db.query(
    `SELECT 
       DATE_TRUNC($2, COALESCE(completed_at, started_at) AT TIME ZONE 'UTC') AS date_point,
       COUNT(*)::INTEGER AS total_attempts,
       COUNT(CASE WHEN status = 'SOLVED' THEN 1 END)::INTEGER AS accepted_attempts
     FROM user_question_progress
     WHERE user_id = $1 AND COALESCE(completed_at, started_at) IS NOT NULL
     GROUP BY date_point
     ORDER BY date_point DESC
     LIMIT $3`,
    [userId, interval, limit]
  );
  // Sort back to ascending for graphs rendering
  return result.rows.reverse();
};

module.exports = {
  getOverallMetrics,
  getAverageAIRating,
  getSubmissionDates,
  getTopicsCompletion,
  getPatternsCompletion,
  getDifficultyDistribution,
  getActivityGraph,
};
