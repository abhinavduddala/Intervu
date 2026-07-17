const db = require('../../config/db');

const SUBMISSION_SELECT = `
  s.id,
  s.user_id,
  s.question_id,
  s.source_code,
  s.language_id,
  s.stdin,
  s.expected_output,
  s.judge0_token,
  s.status_id,
  s.status_description,
  s.stdout,
  s.stderr,
  s.compile_output,
  s.execution_time,
  s.execution_memory,
  s.created_at,
  s.updated_at,
  q.title AS question_title
`;

const SUBMISSION_FROM = `
  FROM submissions s
  INNER JOIN questions q ON s.question_id = q.id
`;

const create = async ({
  userId,
  questionId,
  sourceCode,
  languageId,
  stdin,
  expectedOutput,
  judge0Token,
}) => {
  const result = await db.query(
    `INSERT INTO submissions (
      user_id,
      question_id,
      source_code,
      language_id,
      stdin,
      expected_output,
      judge0_token,
      status_id,
      status_description
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      userId,
      questionId,
      sourceCode,
      languageId,
      stdin || null,
      expectedOutput || null,
      judge0Token,
      1, // Status ID 1 (In Queue)
      'In Queue',
    ]
  );
  
  return findById(result.rows[0].id);
};

const findById = async (id) => {
  const result = await db.query(
    `SELECT ${SUBMISSION_SELECT}
     ${SUBMISSION_FROM}
     WHERE s.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const update = async (id, updates) => {
  const fields = [];
  const values = [id];
  let paramIndex = 2;

  const allowedFields = [
    'status_id',
    'status_description',
    'stdout',
    'stderr',
    'compile_output',
    'execution_time',
    'execution_memory',
  ];

  allowedFields.forEach((field) => {
    // Convert camelCase parameters to snake_case table columns
    const camelKey = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    const val = updates[camelKey] !== undefined ? updates[camelKey] : updates[field];
    
    if (val !== undefined) {
      fields.push(`${field} = $${paramIndex++}`);
      values.push(val);
    }
  });

  if (fields.length === 0) {
    return findById(id);
  }

  fields.push('updated_at = NOW()');

  const result = await db.query(
    `UPDATE submissions
     SET ${fields.join(', ')}
     WHERE id = $1
     RETURNING id`,
    values
  );

  if (result.rowCount === 0) {
    return null;
  }

  return findById(id);
};

const buildHistoryFilters = (userId, filters) => {
  const conditions = ['s.user_id = $1'];
  const values = [userId];
  let paramIndex = 2;

  if (filters.questionId) {
    conditions.push(`s.question_id = $${paramIndex++}`);
    values.push(Number(filters.questionId));
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  return { whereClause, values, paramIndex };
};

const findByUser = async (userId, { page, limit, questionId }) => {
  const { whereClause, values, paramIndex } = buildHistoryFilters(userId, { questionId });
  const offset = (page - 1) * limit;
  
  values.push(limit, offset);
  
  const result = await db.query(
    `SELECT ${SUBMISSION_SELECT}
     ${SUBMISSION_FROM}
     ${whereClause}
     ORDER BY s.created_at DESC, s.id DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    values
  );
  
  return result.rows;
};

const countByUser = async (userId, { questionId }) => {
  const { whereClause, values } = buildHistoryFilters(userId, { questionId });
  
  const result = await db.query(
    `SELECT COUNT(*)::INTEGER AS total
     ${SUBMISSION_FROM}
     ${whereClause}`,
    values
  );
  
  return result.rows[0].total;
};

const updateToken = async (id, token) => {
  const result = await db.query(
    `UPDATE submissions
     SET judge0_token = $2
     WHERE id = $1
     RETURNING id`,
    [id, token]
  );
  return result.rows[0];
};

module.exports = {
  create,
  findById,
  update,
  updateToken,
  findByUser,
  countByUser,
};
