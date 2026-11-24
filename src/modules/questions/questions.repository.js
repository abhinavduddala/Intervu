const db = require('../../config/db');

const QUESTION_SELECT = `
  q.id,
  q.title,
  q.slug,
  q.difficulty,
  q.leetcode_url,
  q.video_solution_url,
  q.notes,
  q.created_at,
  q.updated_at,
  q.source,
  q.source_url,
  q.article_url,
  q.company_tags,
  q.estimated_time,
  q.hint,
  t.id   AS topic_id,
  t.name AS topic_name,
  p.id   AS pattern_id,
  p.name AS pattern_name
`;

const QUESTION_FROM = `
  FROM questions q
  INNER JOIN topics t ON q.topic_id = t.id
  INNER JOIN patterns p ON q.pattern_id = p.id
`;

const findTopicByName = async (name, client = db) => {
  const result = await client.query(
    `SELECT id, name FROM topics WHERE LOWER(name) = LOWER($1)`,
    [name]
  );
  return result.rows[0] || null;
};

const findPatternByName = async (name, client = db) => {
  const result = await client.query(
    `SELECT id, name FROM patterns WHERE LOWER(name) = LOWER($1)`,
    [name]
  );
  return result.rows[0] || null;
};

const createTopic = async (name, client = db) => {
  const result = await client.query(
    `INSERT INTO topics (name) VALUES ($1) RETURNING id, name`,
    [name]
  );
  return result.rows[0];
};

const createPattern = async (name, client = db) => {
  const result = await client.query(
    `INSERT INTO patterns (name) VALUES ($1) RETURNING id, name`,
    [name]
  );
  return result.rows[0];
};

const resolveTopic = async (name, client = db) => {
  const existing = await findTopicByName(name, client);
  if (existing) {
    return existing;
  }
  return createTopic(name, client);
};

const resolvePattern = async (name, client = db) => {
  const existing = await findPatternByName(name, client);
  if (existing) {
    return existing;
  }
  return createPattern(name, client);
};

const buildFilters = (filters) => {
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (filters.topicId) {
    const tId = Number(filters.topicId);
    if (tId === 10) { // Two Pointers
      conditions.push(`(q.topic_id = $${paramIndex++} OR q.pattern_id = $${paramIndex++})`);
      values.push(10, 1);
    } else if (tId === 11) { // Sliding Window
      conditions.push(`(q.topic_id = $${paramIndex++} OR q.pattern_id = $${paramIndex++})`);
      values.push(11, 8);
    } else if (tId === 7) { // Stacks
      conditions.push(`(q.topic_id = $${paramIndex++} OR q.pattern_id = $${paramIndex++})`);
      values.push(7, 11);
    } else if (tId === 8) { // Linked Lists
      conditions.push(`(q.topic_id = $${paramIndex++} OR q.pattern_id = $${paramIndex++})`);
      values.push(8, 12);
    } else if (tId === 13) { // Binary Search
      conditions.push(`(q.topic_id = $${paramIndex++} OR q.pattern_id = $${paramIndex++})`);
      values.push(13, 7);
    } else if (tId === 15) { // Trie
      conditions.push(`(q.topic_id = $${paramIndex++} OR q.pattern_id = $${paramIndex++})`);
      values.push(15, 34);
    } else if (tId === 16) { // Backtracking
      conditions.push(`(q.topic_id = $${paramIndex++} OR q.pattern_id = $${paramIndex++})`);
      values.push(16, 13);
    } else if (tId === 3) { // Graphs
      conditions.push(`(q.topic_id = $${paramIndex++} OR q.pattern_id = $${paramIndex++} OR q.pattern_id = $${paramIndex++})`);
      values.push(3, 6, 20);
    } else if (tId === 5) { // Dynamic Programming
      conditions.push(`(q.topic_id = $${paramIndex++} OR q.pattern_id = $${paramIndex++})`);
      values.push(5, 14);
    } else if (tId === 20) { // Greedy
      conditions.push(`(q.topic_id = $${paramIndex++} OR q.pattern_id = $${paramIndex++})`);
      values.push(20, 15);
    } else if (tId === 23) { // Bit Manipulation
      conditions.push(`(q.topic_id = $${paramIndex++} OR q.pattern_id = $${paramIndex++})`);
      values.push(23, 16);
    } else {
      conditions.push(`q.topic_id = $${paramIndex++}`);
      values.push(tId);
    }
  } else if (filters.topic) {
    conditions.push(`LOWER(t.name) = LOWER($${paramIndex++})`);
    values.push(filters.topic);
  }

  if (filters.patternId) {
    conditions.push(`q.pattern_id = $${paramIndex++}`);
    values.push(filters.patternId);
  } else if (filters.pattern) {
    conditions.push(`LOWER(p.name) = LOWER($${paramIndex++})`);
    values.push(filters.pattern);
  }

  if (filters.difficulty) {
    conditions.push(`q.difficulty = $${paramIndex++}`);
    values.push(filters.difficulty);
  }

  if (filters.search) {
    conditions.push(`q.title ILIKE $${paramIndex++}`);
    values.push(`%${filters.search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return { whereClause, values, paramIndex };
};

const findAll = async ({ topic, topicId, pattern, patternId, difficulty, search, page, limit }) => {
  let { whereClause, values, paramIndex } = buildFilters({
    topic,
    topicId,
    pattern,
    patternId,
    difficulty,
    search,
  });

  const offset = (page - 1) * limit;
  values.push(limit, offset);

  const result = await db.query(
    `SELECT ${QUESTION_SELECT}
     ${QUESTION_FROM}
     ${whereClause}
     ORDER BY q.created_at DESC, q.id DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    values
  );

  return result.rows;
};

const countAll = async ({ topic, topicId, pattern, patternId, difficulty, search }) => {
  const { whereClause, values } = buildFilters({ topic, topicId, pattern, patternId, difficulty, search });

  const result = await db.query(
    `SELECT COUNT(*)::INTEGER AS total
     ${QUESTION_FROM}
     ${whereClause}`,
    values
  );

  return result.rows[0].total;
};

const findById = async (id) => {
  const result = await db.query(
    `SELECT ${QUESTION_SELECT}
     ${QUESTION_FROM}
     WHERE q.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const findBySlug = async (slug) => {
  const result = await db.query(
    `SELECT ${QUESTION_SELECT}
     ${QUESTION_FROM}
     WHERE q.slug = $1`,
    [slug]
  );
  return result.rows[0] || null;
};

const create = async ({ title, slug, topicId, patternId, difficulty, leetcodeUrl, videoSolutionUrl, notes }) => {
  const result = await db.query(
    `INSERT INTO questions (title, slug, topic_id, pattern_id, difficulty, leetcode_url, video_solution_url, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [title, slug, topicId, patternId, difficulty, leetcodeUrl ?? null, videoSolutionUrl ?? null, notes ?? null]
  );

  return findById(result.rows[0].id);
};

const update = async (id, { title, slug, topicId, patternId, difficulty, leetcodeUrl, videoSolutionUrl, notes }) => {
  const fields = [];
  const values = [id];
  let paramIndex = 2;

  if (title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(title);
  }
  if (slug !== undefined) {
    fields.push(`slug = $${paramIndex++}`);
    values.push(slug);
  }
  if (topicId !== undefined) {
    fields.push(`topic_id = $${paramIndex++}`);
    values.push(topicId);
  }
  if (patternId !== undefined) {
    fields.push(`pattern_id = $${paramIndex++}`);
    values.push(patternId);
  }
  if (difficulty !== undefined) {
    fields.push(`difficulty = $${paramIndex++}`);
    values.push(difficulty);
  }
  if (leetcodeUrl !== undefined) {
    fields.push(`leetcode_url = $${paramIndex++}`);
    values.push(leetcodeUrl);
  }
  if (videoSolutionUrl !== undefined) {
    fields.push(`video_solution_url = $${paramIndex++}`);
    values.push(videoSolutionUrl);
  }
  if (notes !== undefined) {
    fields.push(`notes = $${paramIndex++}`);
    values.push(notes);
  }

  if (fields.length === 0) {
    return findById(id);
  }

  fields.push('updated_at = NOW()');

  const result = await db.query(
    `UPDATE questions
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

const deleteById = async (id) => {
  const result = await db.query(`DELETE FROM questions WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0] || null;
};

const findAllTopics = async () => {
  const result = await db.query(`SELECT id, name, created_at, updated_at FROM topics ORDER BY name ASC`);
  return result.rows;
};

const findAllPatterns = async () => {
  const result = await db.query(`SELECT id, name, created_at, updated_at FROM patterns ORDER BY name ASC`);
  return result.rows;
};

const findProgress = async (userId, questionId) => {
  const result = await db.query(
    `SELECT id, user_id, question_id, status, started_at, completed_at, leetcode_submission_url, notes, favorite, revision_count, last_revised_at
     FROM user_question_progress
     WHERE user_id = $1 AND question_id = $2`,
    [userId, questionId]
  );
  return result.rows[0] || null;
};

const upsertProgress = async (userId, questionId, data) => {
  const result = await db.query(
    `INSERT INTO user_question_progress (
       user_id, question_id, status, started_at, completed_at, leetcode_submission_url, notes, favorite, revision_count, last_revised_at
     )
     -- NOT NULL columns fall back to their defaults on insert; updates keep existing values when a param is null
     VALUES ($1, $2, COALESCE($3, 'NOT_STARTED'), $4, $5, $6, $7, COALESCE($8, FALSE), COALESCE($9, 0), $10)
     ON CONFLICT (user_id, question_id) DO UPDATE SET
       status = COALESCE($3, user_question_progress.status),
       started_at = COALESCE(EXCLUDED.started_at, user_question_progress.started_at),
       completed_at = COALESCE(EXCLUDED.completed_at, user_question_progress.completed_at),
       leetcode_submission_url = COALESCE(EXCLUDED.leetcode_submission_url, user_question_progress.leetcode_submission_url),
       notes = COALESCE(EXCLUDED.notes, user_question_progress.notes),
       favorite = COALESCE($8, user_question_progress.favorite),
       revision_count = COALESCE($9, user_question_progress.revision_count),
       last_revised_at = COALESCE(EXCLUDED.last_revised_at, user_question_progress.last_revised_at)
     RETURNING id, user_id, question_id, status, started_at, completed_at, leetcode_submission_url, notes, favorite, revision_count, last_revised_at`,
    [
      userId,
      questionId,
      data.status || null,
      data.startedAt || null,
      data.completedAt || null,
      data.leetcodeSubmissionUrl || null,
      data.notes || null,
      data.favorite !== undefined ? data.favorite : null,
      data.revisionCount !== undefined ? data.revisionCount : null,
      data.lastRevisedAt || null
    ]
  );
  return result.rows[0];
};

const getUserProgressList = async (userId) => {
  const result = await db.query(
    `SELECT id, user_id, question_id, status, started_at, completed_at, leetcode_submission_url, notes, favorite, revision_count, last_revised_at
     FROM user_question_progress
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows;
};

const findAllCompanies = async () => {
  const result = await db.query(
    `SELECT DISTINCT unnest(company_tags) AS company 
     FROM questions 
     WHERE company_tags IS NOT NULL 
     ORDER BY company ASC`
  );
  return result.rows.map(row => row.company);
};

module.exports = {
  findTopicByName,
  findPatternByName,
  resolveTopic,
  resolvePattern,
  findAll,
  countAll,
  findById,
  findBySlug,
  create,
  update,
  deleteById,
  findAllTopics,
  findAllPatterns,
  findProgress,
  upsertProgress,
  getUserProgressList,
  findAllCompanies,
};
