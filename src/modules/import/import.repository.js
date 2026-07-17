const db = require('../../config/db');

const findTopicByName = async (name, client = db) => {
  const result = await client.query(
    'SELECT id, name FROM topics WHERE LOWER(name) = LOWER($1)',
    [name.trim()]
  );
  return result.rows[0] || null;
};

const findPatternByName = async (name, client = db) => {
  const result = await client.query(
    'SELECT id, name FROM patterns WHERE LOWER(name) = LOWER($1)',
    [name.trim()]
  );
  return result.rows[0] || null;
};

const findBySlugOrTitle = async (slug, title, client = db) => {
  const result = await client.query(
    'SELECT id, title, slug FROM questions WHERE slug = $1 OR LOWER(title) = LOWER($2)',
    [slug, title.trim()]
  );
  return result.rows[0] || null;
};

const insertQuestion = async (data, client = db) => {
  const result = await client.query(
    `INSERT INTO questions (
      title, slug, topic_id, pattern_id, difficulty, source, source_url,
      estimated_time_minutes, frequency, company_tags, video_solution_url,
      article_url, hint, is_premium, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING id`,
    [
      data.title.trim(),
      data.slug,
      data.topic_id,
      data.pattern_id,
      data.difficulty.toLowerCase(),
      data.source || 'leetcode',
      data.source_url || null,
      data.estimated_time_minutes || null,
      data.frequency || null,
      data.company_tags || [],
      data.video_solution_url || null,
      data.article_url || null,
      data.hint || null,
      data.is_premium ?? false,
      data.is_active ?? true
    ]
  );
  return result.rows[0];
};

module.exports = {
  findTopicByName,
  findPatternByName,
  findBySlugOrTitle,
  insertQuestion,
};
