const db = require('../../config/db');

const findProblemContent = async (questionId) => {
  const result = await db.query(
    `SELECT question_id, content, model_name, created_at, updated_at
     FROM question_problem_content
     WHERE question_id = $1`,
    [questionId]
  );
  return result.rows[0] || null;
};

const saveProblemContent = async (questionId, content, modelName) => {
  const result = await db.query(
    `INSERT INTO question_problem_content (question_id, content, model_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (question_id) DO UPDATE
       SET content = EXCLUDED.content,
           model_name = EXCLUDED.model_name,
           updated_at = NOW()
     RETURNING question_id, content, model_name, created_at, updated_at`,
    [questionId, JSON.stringify(content), modelName]
  );
  return result.rows[0];
};

module.exports = {
  findProblemContent,
  saveProblemContent,
};
