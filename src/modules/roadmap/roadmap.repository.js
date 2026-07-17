const db = require('../../config/db');

const getRoadmapData = async (userId) => {
  const result = await db.query(
    `SELECT 
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
       q.learning_order,
       q.prerequisites,
       q.recommended_next,
       t.id   AS topic_id,
       t.name AS topic_name,
       p.id   AS pattern_id,
       p.name AS pattern_name,
       uqp.status AS progress_status,
       uqp.started_at,
       uqp.completed_at
     FROM questions q
     INNER JOIN topics t ON q.topic_id = t.id
     INNER JOIN patterns p ON q.pattern_id = p.id
     LEFT JOIN user_question_progress uqp ON q.id = uqp.question_id AND uqp.user_id = $1
     ORDER BY COALESCE(q.learning_order, 999999) ASC, q.id ASC`,
    [userId]
  );
  return result.rows;
};

module.exports = {
  getRoadmapData,
};
