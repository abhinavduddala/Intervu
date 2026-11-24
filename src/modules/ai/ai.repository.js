const db = require('../../config/db');

const create = async ({
  userId,
  questionId,
  language,
  submittedCode,
  analysisResult = null,
  modelName = null,
  provider = null,
  status = 'pending',
  submissionId = null,
}) => {
  const result = await db.query(
    `INSERT INTO ai_analyses (
      user_id,
      question_id,
      language,
      submitted_code,
      analysis_result,
      model_name,
      provider,
      status,
      submission_id
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, user_id, question_id, language, submitted_code, analysis_result, model_name, provider, status, error_message, submission_id, created_at`,
    [
      userId,
      questionId,
      language,
      submittedCode,
      analysisResult ? (typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult)) : null,
      modelName,
      provider,
      status,
      submissionId,
    ]
  );
  return result.rows[0];
};

const findById = async (id) => {
  const result = await db.query(
    `SELECT id, user_id, question_id, language, submitted_code, analysis_result, model_name, provider, status, error_message, submission_id, created_at
     FROM ai_analyses
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const findByUserId = async (userId) => {
  const result = await db.query(
    `SELECT id, user_id, question_id, language, submitted_code, analysis_result, model_name, provider, status, error_message, submission_id, created_at
     FROM ai_analyses
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

const findByQuestionId = async (userId, questionId) => {
  const result = await db.query(
    `SELECT id, user_id, question_id, language, submitted_code, analysis_result, model_name, provider, status, error_message, submission_id, created_at
     FROM ai_analyses
     WHERE user_id = $1 AND question_id = $2
     ORDER BY created_at DESC`,
    [userId, questionId]
  );
  return result.rows;
};

const findBySubmissionId = async (submissionId) => {
  const result = await db.query(
    `SELECT id, submission_id, user_id, question_id, detected_language, time_complexity, space_complexity, complexity_explanation, optimized_code, optimization_summary, interview_feedback, edge_cases, alternative_approach, ai_model, tokens_used, processing_time, created_at
     FROM ai_analysis
     WHERE submission_id = $1`,
    [submissionId]
  );
  return result.rows[0] || null;
};

const updateStatus = async (id, status, errorMessage = null) => {
  const result = await db.query(
    `UPDATE ai_analyses
     SET status = $2,
         error_message = $3
     WHERE id = $1
     RETURNING id, status`,
    [id, status, errorMessage]
  );
  return result.rows[0];
};

const updateAnalysis = async (id, { analysisResult, modelName, provider, status }) => {
  const result = await db.query(
    `UPDATE ai_analyses
     SET analysis_result = $2,
         model_name = $3,
         provider = $4,
         status = $5,
         error_message = NULL
     WHERE id = $1
     RETURNING id, user_id, question_id, language, submitted_code, analysis_result, model_name, provider, status, error_message, submission_id, created_at`,
    [
      id,
      analysisResult ? (typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult)) : null,
      modelName,
      provider,
      status
    ]
  );
  return result.rows[0];
};

module.exports = {
  create,
  findById,
  findByUserId,
  findByQuestionId,
  findBySubmissionId,
  updateStatus,
  updateAnalysis,
};
