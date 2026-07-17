const importRepository = require('./import.repository');
const logger = require('../../utils/logger');

const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

const importQuestions = async (questionsArray) => {
  if (!Array.isArray(questionsArray)) {
    throw new Error('Invalid payload: expected an array of questions');
  }

  let inserted = 0;
  let duplicates = 0;
  let failed = 0;

  const seenSlugsInBatch = new Set();
  const seenTitlesInBatch = new Set();

  for (const item of questionsArray) {
    try {
      // 1. Basic validation of required fields
      if (!item.title || typeof item.title !== 'string' || !item.title.trim()) {
        logger.warn('Import Validation: Question title is missing or invalid.');
        failed++;
        continue;
      }

      if (!item.difficulty || typeof item.difficulty !== 'string') {
        logger.warn(`Import Validation: Question "${item.title}" difficulty is missing or invalid.`);
        failed++;
        continue;
      }

      const normDifficulty = item.difficulty.trim().toLowerCase();
      if (!['easy', 'medium', 'hard'].includes(normDifficulty)) {
        logger.warn(`Import Validation: Question "${item.title}" has invalid difficulty "${item.difficulty}".`);
        failed++;
        continue;
      }

      // Check estimatedTime
      if (item.estimatedTime !== undefined && item.estimatedTime !== null) {
        const estTime = Number(item.estimatedTime);
        if (isNaN(estTime) || estTime <= 0) {
          logger.warn(`Import Validation: Question "${item.title}" estimatedTime must be a positive number.`);
          failed++;
          continue;
        }
      }

      // Check sourceUrl format
      if (item.sourceUrl && typeof item.sourceUrl === 'string') {
        try {
          new URL(item.sourceUrl);
        } catch (e) {
          logger.warn(`Import Validation: Question "${item.title}" sourceUrl "${item.sourceUrl}" is invalid.`);
          failed++;
          continue;
        }
      }

      // Check companies array format
      if (item.companies !== undefined && !Array.isArray(item.companies)) {
        logger.warn(`Import Validation: Question "${item.title}" companies must be an array.`);
        failed++;
        continue;
      }

      // 2. Validate topic exists in the database
      if (!item.topic || typeof item.topic !== 'string') {
        logger.warn(`Import Validation: Question "${item.title}" topic is missing or invalid.`);
        failed++;
        continue;
      }
      const topicRecord = await importRepository.findTopicByName(item.topic);
      if (!topicRecord) {
        logger.warn(`Import Validation: Topic "${item.topic}" does not exist in the database.`);
        failed++;
        continue;
      }

      // 3. Validate pattern exists in the database
      if (!item.pattern || typeof item.pattern !== 'string') {
        logger.warn(`Import Validation: Question "${item.title}" pattern is missing or invalid.`);
        failed++;
        continue;
      }
      const patternRecord = await importRepository.findPatternByName(item.pattern);
      if (!patternRecord) {
        logger.warn(`Import Validation: Pattern "${item.pattern}" does not exist in the database.`);
        failed++;
        continue;
      }

      // 4. Slug uniqueness & duplicate check
      const slug = slugify(item.title);
      
      // Batch duplicate check
      const titleLower = item.title.trim().toLowerCase();
      if (seenSlugsInBatch.has(slug) || seenTitlesInBatch.has(titleLower)) {
        logger.info(`Import Check: Question "${item.title}" is a duplicate in the upload batch.`);
        duplicates++;
        continue;
      }

      // Database duplicate check (slug or title)
      const existingDbQuestion = await importRepository.findBySlugOrTitle(slug, item.title);
      if (existingDbQuestion) {
        logger.info(`Import Check: Question "${item.title}" (slug: ${slug}) already exists in the database.`);
        duplicates++;
        continue;
      }

      // Track in current batch to avoid internal duplicates
      seenSlugsInBatch.add(slug);
      seenTitlesInBatch.add(titleLower);

      // 5. Insert valid question
      const questionData = {
        title: item.title,
        slug: slug,
        topic_id: topicRecord.id,
        pattern_id: patternRecord.id,
        difficulty: normDifficulty,
        source: item.source || 'leetcode',
        source_url: item.sourceUrl,
        estimated_time_minutes: item.estimatedTime ? Number(item.estimatedTime) : null,
        frequency: item.frequency,
        company_tags: item.companies || [],
        video_solution_url: item.videoSolutionUrl,
        article_url: item.articleUrl,
        hint: item.hint,
        is_premium: item.isPremium === true,
        is_active: item.isActive !== false
      };

      await importRepository.insertQuestion(questionData);
      inserted++;
    } catch (err) {
      logger.error(`Import Error: Failed to process question "${item?.title || 'Unknown'}":`, err);
      failed++;
    }
  }

  return {
    inserted,
    duplicates,
    failed
  };
};

module.exports = {
  importQuestions,
};
