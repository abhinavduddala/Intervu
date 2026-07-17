const db = require('../../config/db');

/**
 * Transactionally inserts a batch of normalized questions.
 * Skips duplicates found in either the DB or the current batch.
 * @param {object[]} normalizedQuestions - The questions to seed.
 * @param {Map} topicsMap - Map of lowercase topic names to topic IDs.
 * @param {Map} patternsMap - Map of lowercase pattern names to pattern IDs.
 * @returns {Promise<{inserted: number, skipped: number}>} Metrics of the seed operation.
 */
const seedQuestionsBatch = async (normalizedQuestions, topicsMap, patternsMap) => {
  const client = await db.pool.connect();
  let inserted = 0;
  let skipped = 0;

  try {
    await client.query('BEGIN');

    // Fetch existing question titles, slugs, and source URLs to check for duplicates
    const existingRes = await client.query('SELECT title, slug, source_url FROM questions');
    const existingTitles = new Set(existingRes.rows.map(row => row.title.toLowerCase().trim()));
    const existingSlugs = new Set(existingRes.rows.map(row => row.slug.toLowerCase().trim()));
    const existingSourceUrls = new Set(
      existingRes.rows
        .map(row => row.source_url)
        .filter(url => typeof url === 'string' && url.trim())
        .map(url => url.toLowerCase().trim())
    );

    for (const q of normalizedQuestions) {
      const titleLower = q.title.toLowerCase().trim();
      const slugLower = q.slug.toLowerCase().trim();
      const sourceUrlLower = q.sourceUrl ? q.sourceUrl.toLowerCase().trim() : null;

      // Duplicate Check: title, slug, or source_url
      const isDuplicate = existingTitles.has(titleLower) ||
                          existingSlugs.has(slugLower) ||
                          (sourceUrlLower && existingSourceUrls.has(sourceUrlLower));

      if (isDuplicate) {
        skipped++;
        continue;
      }

      // Add to sets to prevent internal batch duplicates
      existingTitles.add(titleLower);
      existingSlugs.add(slugLower);
      if (sourceUrlLower) {
        existingSourceUrls.add(sourceUrlLower);
      }

      const topicId = topicsMap.get(q.topic.toLowerCase().trim());
      const patternId = patternsMap.get(q.pattern.toLowerCase().trim());

      // 20-field insertion statement
      await client.query(
        `INSERT INTO questions (
          title, slug, topic_id, pattern_id, difficulty, learning_order,
          estimated_time_minutes, frequency, source, source_url, company_tags,
          video_solution_url, article_url, hint, prerequisites, recommended_next,
          acceptance_rate, revision_priority, is_premium, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        [
          q.title,
          q.slug,
          topicId,
          patternId,
          q.difficulty,
          q.learningOrder !== undefined && q.learningOrder !== null ? Number(q.learningOrder) : null,
          q.estimatedTime !== undefined && q.estimatedTime !== null ? Number(q.estimatedTime) : null,
          q.frequency || null,
          q.source,
          q.sourceUrl,
          q.companyTags || [],
          q.videoSolutionUrl,
          q.articleUrl,
          q.hint,
          JSON.stringify(q.prerequisites || []),
          JSON.stringify(q.recommendedNext || []),
          q.acceptanceRate !== undefined && q.acceptanceRate !== null ? Number(q.acceptanceRate) : null,
          q.revisionPriority !== undefined && q.revisionPriority !== null ? Number(q.revisionPriority) : null,
          q.isPremium === true,
          q.isActive !== false
        ]
      );

      inserted++;
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return {
    inserted,
    skipped
  };
};

module.exports = {
  seedQuestionsBatch
};
