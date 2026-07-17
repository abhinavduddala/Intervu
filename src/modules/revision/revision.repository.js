const db = require('../../config/db');

const REVISION_SELECT = `
  r.id,
  r.user_id,
  r.question_id,
  r.revision_stage,
  r.next_revision_date,
  r.last_revision_date,
  r.revision_count,
  r.confidence_score,
  r.reason,
  r.status,
  r.created_at,
  r.updated_at,
  q.title AS question_title,
  q.difficulty AS question_difficulty,
  t.name AS topic_name,
  p.name AS pattern_name
`;

const REVISION_FROM = `
  FROM revision_queue r
  INNER JOIN questions q ON r.question_id = q.id
  INNER JOIN topics t ON q.topic_id = t.id
  INNER JOIN patterns p ON q.pattern_id = p.id
`;

const findById = async (id) => {
  const result = await db.query(
    `SELECT ${REVISION_SELECT}
     ${REVISION_FROM}
     WHERE r.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const findByUserAndQuestion = async (userId, questionId) => {
  const result = await db.query(
    `SELECT ${REVISION_SELECT}
     ${REVISION_FROM}
     WHERE r.user_id = $1 AND r.question_id = $2`,
    [userId, questionId]
  );
  return result.rows[0] || null;
};

const upsert = async ({
  userId,
  questionId,
  revisionStage = 1,
  nextRevisionDate,
  confidenceScore,
  reason,
  status = 'active',
}) => {
  const result = await db.query(
    `INSERT INTO revision_queue (
      user_id,
      question_id,
      revision_stage,
      next_revision_date,
      confidence_score,
      reason,
      status,
      updated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (user_id, question_id) DO UPDATE
     SET revision_stage = EXCLUDED.revision_stage,
         next_revision_date = EXCLUDED.next_revision_date,
         confidence_score = EXCLUDED.confidence_score,
         reason = EXCLUDED.reason,
         status = EXCLUDED.status,
         updated_at = NOW()
     RETURNING id`,
    [userId, questionId, revisionStage, nextRevisionDate, confidenceScore, reason, status]
  );
  
  return findById(result.rows[0].id);
};

const findActiveRevisionsToday = async (userId) => {
  const result = await db.query(
    `SELECT ${REVISION_SELECT}
     ${REVISION_FROM}
     WHERE r.user_id = $1 AND r.status = 'active' AND r.next_revision_date <= NOW()
     ORDER BY r.next_revision_date ASC, r.confidence_score ASC`,
    [userId]
  );
  return result.rows;
};

const findActiveRevisionsUpcoming = async (userId, days = 30) => {
  const result = await db.query(
    `SELECT ${REVISION_SELECT}
     ${REVISION_FROM}
     WHERE r.user_id = $1 AND r.status = 'active' AND r.next_revision_date > NOW() AND r.next_revision_date <= NOW() + ($2 * INTERVAL '1 day')
     ORDER BY r.next_revision_date ASC, r.confidence_score ASC`,
    [userId, days]
  );
  return result.rows;
};

const update = async (id, updates) => {
  const fields = [];
  const values = [id];
  let paramIndex = 2;

  const allowedFields = [
    'revision_stage',
    'next_revision_date',
    'last_revision_date',
    'revision_count',
    'confidence_score',
    'reason',
    'status',
  ];

  allowedFields.forEach((field) => {
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
    `UPDATE revision_queue
     SET ${fields.join(', ')}
     WHERE id = $1
     RETURNING id`,
    values
  );

  return findById(result.rows[0].id);
};

const getRevisionStats = async (userId) => {
  // Today Count (due or overdue)
  const todayRes = await db.query(
    `SELECT COUNT(*)::INTEGER AS count
     FROM revision_queue
     WHERE user_id = $1 AND status = 'active' AND next_revision_date <= NOW()`,
    [userId]
  );

  // Overdue Count (next_revision_date < NOW())
  const overdueRes = await db.query(
    `SELECT COUNT(*)::INTEGER AS count
     FROM revision_queue
     WHERE user_id = $1 AND status = 'active' AND next_revision_date < NOW()`,
    [userId]
  );

  // Upcoming Count (next 30 days)
  const upcomingRes = await db.query(
    `SELECT COUNT(*)::INTEGER AS count
     FROM revision_queue
     WHERE user_id = $1 AND status = 'active' AND next_revision_date > NOW() AND next_revision_date <= NOW() + INTERVAL '30 days'`,
    [userId]
  );

  return {
    todayCount: todayRes.rows[0].count,
    overdueCount: overdueRes.rows[0].count,
    upcomingCount: upcomingRes.rows[0].count,
  };
};

const findUserSolvedQuestionsMissingRevision = async (userId) => {
  // Find solved questions that are NOT currently in the revision_queue table
  // and whose last accepted submission was > 14 days ago.
  const result = await db.query(
    `SELECT DISTINCT q.id, q.title, q.difficulty, t.name AS topic_name, p.name AS pattern_name, MAX(s.created_at) AS last_solved_at
     FROM questions q
     INNER JOIN topics t ON q.topic_id = t.id
     INNER JOIN patterns p ON q.pattern_id = p.id
     INNER JOIN submissions s ON s.question_id = q.id
     LEFT JOIN revision_queue r ON r.question_id = q.id AND r.user_id = s.user_id
     WHERE s.user_id = $1 AND s.status_id = 3 AND r.id IS NULL
     GROUP BY q.id, q.title, q.difficulty, t.name, p.name
     HAVING MAX(s.created_at) < NOW() - INTERVAL '14 days'`,
    [userId]
  );
  return result.rows;
};

module.exports = {
  upsert,
  findById,
  findByUserAndQuestion,
  findActiveRevisionsToday,
  findActiveRevisionsUpcoming,
  update,
  getRevisionStats,
  findUserSolvedQuestionsMissingRevision,
};
