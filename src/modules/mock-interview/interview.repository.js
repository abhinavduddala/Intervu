const db = require('../../config/db');

const json = (value) => (value === undefined || value === null ? null : JSON.stringify(value));

const INTERVIEW_COLUMNS = `id, user_id, company_name, interview_type, job_role, experience_level, difficulty, mode,
  duration_minutes, question_target, programming_language, candidate_context, plan, state, status, turn_state,
  questions_asked, started_at, paused_at, paused_seconds, ends_at, last_activity_at, completed_at, end_reason,
  overall_score, created_at, updated_at`;

const MESSAGE_COLUMNS = `id, interview_id, sender, message, intent, question_number, section, topic, difficulty,
  input_mode, meta, client_message_id, created_at`;

const EVALUATION_COLUMNS = `id, interview_id, status, error_message, overall_score, technical_knowledge, problem_solving,
  communication, logical_thinking, accuracy, confidence, optimization, time_management, readiness_level, report,
  created_at, completed_at`;

/** Run `fn(client)` inside a transaction. */
const withTransaction = async (fn) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
};

const createInterview = async (client, data) => {
  const { rows } = await client.query(
    `INSERT INTO mock_interviews (
       user_id, company_name, interview_type, job_role, experience_level, difficulty, mode,
       duration_minutes, question_target, programming_language, candidate_context, ends_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW() + make_interval(mins => $8))
     RETURNING ${INTERVIEW_COLUMNS}`,
    [
      data.userId,
      data.companyName,
      data.interviewType,
      data.jobRole,
      data.experienceLevel,
      data.difficulty,
      data.mode,
      data.durationMinutes,
      data.questionTarget,
      data.programmingLanguage,
      data.candidateContext,
    ]
  );
  return rows[0];
};

/** Updates any subset of mutable interview columns. */
const UPDATABLE = {
  plan: 'plan',
  state: 'state',
  status: 'status',
  turnState: 'turn_state',
  questionsAsked: 'questions_asked',
  pausedAt: 'paused_at',
  pausedSeconds: 'paused_seconds',
  endsAt: 'ends_at',
  completedAt: 'completed_at',
  endReason: 'end_reason',
  overallScore: 'overall_score',
};

const updateInterview = async (executor, id, fields) => {
  const sets = [];
  const params = [];
  Object.entries(fields).forEach(([key, value]) => {
    const column = UPDATABLE[key];
    if (!column) return;
    params.push(column === 'plan' || column === 'state' ? json(value) : value);
    sets.push(`${column} = $${params.length}`);
  });
  params.push(id);
  const { rows } = await executor.query(
    `UPDATE mock_interviews
     SET ${sets.join(', ')}${sets.length ? ', ' : ''}last_activity_at = NOW(), updated_at = NOW()
     WHERE id = $${params.length}
     RETURNING ${INTERVIEW_COLUMNS}`,
    params
  );
  return rows[0] || null;
};

const findById = async (id, executor = db) => {
  const { rows } = await executor.query(`SELECT ${INTERVIEW_COLUMNS} FROM mock_interviews WHERE id = $1`, [id]);
  return rows[0] || null;
};

/** Row-locks the interview for the rest of the transaction. */
const lockById = async (client, id) => {
  const { rows } = await client.query(`SELECT ${INTERVIEW_COLUMNS} FROM mock_interviews WHERE id = $1 FOR UPDATE`, [id]);
  return rows[0] || null;
};

const findActiveByUser = async (userId) => {
  const { rows } = await db.query(
    `SELECT ${INTERVIEW_COLUMNS} FROM mock_interviews
     WHERE user_id = $1 AND status IN ('in_progress', 'paused')
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

const listByUser = async (userId, { limit, offset }) => {
  const [list, count] = await Promise.all([
    db.query(
      `SELECT mi.id, mi.company_name, mi.interview_type, mi.job_role, mi.experience_level, mi.difficulty, mi.mode,
              mi.duration_minutes, mi.question_target, mi.status, mi.questions_asked, mi.started_at, mi.completed_at,
              mi.end_reason, mi.overall_score, mi.created_at, e.status AS evaluation_status, e.readiness_level
       FROM mock_interviews mi
       LEFT JOIN mock_interview_evaluations e ON e.interview_id = mi.id
       WHERE mi.user_id = $1
       ORDER BY mi.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    ),
    db.query('SELECT COUNT(*)::INTEGER AS total FROM mock_interviews WHERE user_id = $1', [userId]),
  ]);
  return { rows: list.rows, total: count.rows[0].total };
};

const deleteById = async (id, userId) => {
  const { rowCount } = await db.query('DELETE FROM mock_interviews WHERE id = $1 AND user_id = $2', [id, userId]);
  return rowCount > 0;
};

// ---- Messages ----

const addMessage = async (executor, data) => {
  const { rows } = await executor.query(
    `INSERT INTO mock_interview_messages (
       interview_id, sender, message, intent, question_number, section, topic, difficulty, input_mode, meta, client_message_id
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING ${MESSAGE_COLUMNS}`,
    [
      data.interviewId,
      data.sender,
      data.message,
      data.intent || null,
      data.questionNumber || null,
      data.section || null,
      data.topic || null,
      data.difficulty || null,
      data.inputMode || null,
      json(data.meta || {}),
      data.clientMessageId || null,
    ]
  );
  return rows[0];
};

const findMessages = async (interviewId, executor = db) => {
  const { rows } = await executor.query(
    `SELECT ${MESSAGE_COLUMNS} FROM mock_interview_messages WHERE interview_id = $1 ORDER BY id ASC`,
    [interviewId]
  );
  return rows;
};

const findMessageByClientId = async (executor, interviewId, clientMessageId) => {
  const { rows } = await executor.query(
    `SELECT ${MESSAGE_COLUMNS} FROM mock_interview_messages WHERE interview_id = $1 AND client_message_id = $2`,
    [interviewId, clientMessageId]
  );
  return rows[0] || null;
};

/** The first interviewer message saved after a given message id. */
const findReplyAfter = async (executor, interviewId, messageId) => {
  const { rows } = await executor.query(
    `SELECT ${MESSAGE_COLUMNS} FROM mock_interview_messages
     WHERE interview_id = $1 AND sender = 'interviewer' AND id > $2
     ORDER BY id ASC LIMIT 1`,
    [interviewId, messageId]
  );
  return rows[0] || null;
};

// ---- Evaluations ----

const upsertPendingEvaluation = async (executor, interviewId) => {
  const { rows } = await executor.query(
    `INSERT INTO mock_interview_evaluations (interview_id, status)
     VALUES ($1, 'pending')
     ON CONFLICT (interview_id) DO UPDATE SET status = 'pending', error_message = NULL
     RETURNING ${EVALUATION_COLUMNS}`,
    [interviewId]
  );
  return rows[0];
};

const findEvaluation = async (interviewId) => {
  const { rows } = await db.query(
    `SELECT ${EVALUATION_COLUMNS} FROM mock_interview_evaluations WHERE interview_id = $1`,
    [interviewId]
  );
  return rows[0] || null;
};

const setEvaluationStatus = async (interviewId, status, errorMessage = null) => {
  await db.query(
    `UPDATE mock_interview_evaluations SET status = $2, error_message = $3 WHERE interview_id = $1`,
    [interviewId, status, errorMessage]
  );
};

const completeEvaluation = async (interviewId, evaluation, modelName) => {
  const score = (key) => evaluation.categories.find((c) => c.key === key)?.score ?? null;
  return withTransaction(async (client) => {
    await client.query(
      `UPDATE mock_interview_evaluations
       SET status = 'completed', error_message = NULL, overall_score = $2,
           technical_knowledge = $3, problem_solving = $4, communication = $5, logical_thinking = $6,
           accuracy = $7, confidence = $8, optimization = $9, time_management = $10,
           readiness_level = $11, report = $12, model_name = $13, completed_at = NOW()
       WHERE interview_id = $1`,
      [
        interviewId,
        evaluation.overallScore,
        score('technical_knowledge'),
        score('problem_solving'),
        score('communication'),
        score('logical_thinking'),
        score('accuracy'),
        score('confidence'),
        score('optimization'),
        score('time_management'),
        evaluation.readinessLevel,
        json(evaluation),
        modelName,
      ]
    );
    await client.query(
      `UPDATE mock_interviews SET status = 'completed', overall_score = $2, updated_at = NOW() WHERE id = $1`,
      [interviewId, evaluation.overallScore]
    );
  });
};

// ---- Stats and recommendations ----

const getStats = async (userId) => {
  const [totals, trend, categories, companies] = await Promise.all([
    db.query(
      `SELECT COUNT(*)::INTEGER AS total,
              COUNT(*) FILTER (WHERE status = 'completed')::INTEGER AS completed,
              ROUND(AVG(overall_score) FILTER (WHERE status = 'completed'), 1)::FLOAT AS average_score,
              MAX(overall_score) FILTER (WHERE status = 'completed')::FLOAT AS best_score
       FROM mock_interviews WHERE user_id = $1`,
      [userId]
    ),
    db.query(
      `SELECT id, overall_score::FLOAT AS score, interview_type, company_name, completed_at
       FROM mock_interviews
       WHERE user_id = $1 AND status = 'completed'
       ORDER BY completed_at DESC LIMIT 20`,
      [userId]
    ),
    db.query(
      `SELECT ROUND(AVG(e.technical_knowledge))::INTEGER AS technical_knowledge,
              ROUND(AVG(e.problem_solving))::INTEGER AS problem_solving,
              ROUND(AVG(e.communication))::INTEGER AS communication,
              ROUND(AVG(e.logical_thinking))::INTEGER AS logical_thinking,
              ROUND(AVG(e.accuracy))::INTEGER AS accuracy,
              ROUND(AVG(e.confidence))::INTEGER AS confidence,
              ROUND(AVG(e.optimization))::INTEGER AS optimization,
              ROUND(AVG(e.time_management))::INTEGER AS time_management
       FROM mock_interview_evaluations e
       INNER JOIN mock_interviews mi ON mi.id = e.interview_id
       WHERE mi.user_id = $1 AND e.status = 'completed'`,
      [userId]
    ),
    // Mock score per company: average of the last 3 completed interviews for that company
    db.query(
      `SELECT company_name, ROUND(AVG(overall_score), 1)::FLOAT AS mock_score, MAX(completed_at) AS last_interview_at,
              COUNT(*)::INTEGER AS interviews
       FROM (
         SELECT company_name, overall_score, completed_at,
                ROW_NUMBER() OVER (PARTITION BY company_name ORDER BY completed_at DESC) AS rn
         FROM mock_interviews
         WHERE user_id = $1 AND status = 'completed' AND company_name IS NOT NULL
       ) recent
       WHERE rn <= 3
       GROUP BY company_name
       ORDER BY company_name`,
      [userId]
    ),
  ]);
  return {
    totals: totals.rows[0],
    trend: trend.rows.reverse(),
    categories: categories.rows[0],
    companies: companies.rows,
  };
};

/**
 * Unsolved questions from the bank whose topic or pattern matches the given names,
 * preferring questions tagged with the company.
 */
const findRecommendedQuestions = async (userId, topicNames, companyName, limit = 6) => {
  if (!topicNames.length) return [];
  const { rows } = await db.query(
    `SELECT q.id, q.title, q.slug, q.difficulty, t.name AS topic_name, p.name AS pattern_name,
            ($3::TEXT IS NOT NULL AND $3 = ANY(q.company_tags)) AS company_match
     FROM questions q
     INNER JOIN topics t ON q.topic_id = t.id
     INNER JOIN patterns p ON q.pattern_id = p.id
     LEFT JOIN user_question_progress uqp ON uqp.question_id = q.id AND uqp.user_id = $1
     WHERE (uqp.status IS NULL OR uqp.status <> 'SOLVED')
       AND (LOWER(t.name) = ANY($2) OR LOWER(p.name) = ANY($2))
     ORDER BY company_match DESC,
              CASE q.difficulty WHEN 'easy' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
              q.id
     LIMIT $4`,
    [userId, topicNames.map((t) => t.toLowerCase()), companyName || null, limit]
  );
  return rows;
};

const findAllTopicAndPatternNames = async () => {
  const { rows } = await db.query('SELECT name FROM topics UNION SELECT name FROM patterns');
  return rows.map((r) => r.name);
};

/** Interviews left running with no activity, to be closed as abandoned. */
const findStaleActive = async (userId, hours) => {
  const { rows } = await db.query(
    `SELECT ${INTERVIEW_COLUMNS} FROM mock_interviews
     WHERE user_id = $1 AND status IN ('in_progress', 'paused')
       AND last_activity_at < NOW() - make_interval(hours => $2)`,
    [userId, hours]
  );
  return rows;
};

module.exports = {
  withTransaction,
  createInterview,
  updateInterview,
  findById,
  lockById,
  findActiveByUser,
  listByUser,
  deleteById,
  addMessage,
  findMessages,
  findMessageByClientId,
  findReplyAfter,
  upsertPendingEvaluation,
  findEvaluation,
  setEvaluationStatus,
  completeEvaluation,
  getStats,
  findRecommendedQuestions,
  findAllTopicAndPatternNames,
  findStaleActive,
};
