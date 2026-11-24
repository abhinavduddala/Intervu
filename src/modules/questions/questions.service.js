const logger = require('../../utils/logger');
const { NotFoundError, ValidationError } = require('../../errors/AppError');
const questionsRepository = require('./questions.repository');

const slugify = (text) => {
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

const generateUniqueSlug = async (title, excludeId = null) => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await questionsRepository.findBySlug(slug);
    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
};

const formatQuestion = (row) => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  topic: row.topic_name,
  pattern: row.pattern_name,
  difficulty: row.difficulty,
  leetcodeUrl: row.leetcode_url,
  videoSolutionUrl: row.video_solution_url,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  source: row.source,
  sourceUrl: row.source_url,
  articleUrl: row.article_url,
  companyTags: row.company_tags,
  estimatedTime: row.estimated_time,
  hint: row.hint,
  learningOrder: row.learning_order ?? row.id,
  acceptanceRate: row.acceptance_rate != null ? parseFloat(row.acceptance_rate) : null,
  frequency: row.frequency || null,
  prerequisites: row.prerequisites || [],
  recommendedNext: row.recommended_next || [],
});

const listQuestions = async (filters) => {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  const [questions, total] = await Promise.all([
    questionsRepository.findAll({ ...filters, page, limit }),
    questionsRepository.countAll(filters),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    questions: questions.map(formatQuestion),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

const getQuestionById = async (id) => {
  const question = await questionsRepository.findById(id);
  if (!question) {
    throw new NotFoundError('Question not found');
  }

  return formatQuestion(question);
};

const getQuestionBySlug = async (slug) => {
  const question = await questionsRepository.findBySlug(slug);
  if (!question) {
    throw new NotFoundError('Question not found');
  }

  return formatQuestion(question);
};

const createQuestion = async (data) => {
  const topic = await questionsRepository.findTopicByName(data.topic);
  if (!topic) {
    throw new ValidationError('Validation failed', [{ field: 'topic', message: `Topic "${data.topic}" does not exist` }]);
  }
  const pattern = await questionsRepository.findPatternByName(data.pattern);
  if (!pattern) {
    throw new ValidationError('Validation failed', [{ field: 'pattern', message: `Pattern "${data.pattern}" does not exist` }]);
  }

  const slug = await generateUniqueSlug(data.title);

  const question = await questionsRepository.create({
    title: data.title,
    slug,
    topicId: topic.id,
    patternId: pattern.id,
    difficulty: data.difficulty,
    leetcodeUrl: data.leetcodeUrl,
    videoSolutionUrl: data.videoSolutionUrl,
    notes: data.notes,
  });

  logger.info(`Question created: id=${question.id} title="${question.title}"`);

  return formatQuestion(question);
};

const updateQuestion = async (id, updates) => {
  const existing = await questionsRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Question not found');
  }

  let topicId;
  if (updates.topic !== undefined) {
    const topic = await questionsRepository.findTopicByName(updates.topic);
    if (!topic) {
      throw new ValidationError('Validation failed', [{ field: 'topic', message: `Topic "${updates.topic}" does not exist` }]);
    }
    topicId = topic.id;
  }

  let patternId;
  if (updates.pattern !== undefined) {
    const pattern = await questionsRepository.findPatternByName(updates.pattern);
    if (!pattern) {
      throw new ValidationError('Validation failed', [{ field: 'pattern', message: `Pattern "${updates.pattern}" does not exist` }]);
    }
    patternId = pattern.id;
  }

  let slug;
  if (updates.title !== undefined && updates.title !== existing.title) {
    slug = await generateUniqueSlug(updates.title, id);
  }

  const updated = await questionsRepository.update(id, {
    title: updates.title,
    slug,
    topicId,
    patternId,
    difficulty: updates.difficulty,
    leetcodeUrl: updates.leetcodeUrl,
    videoSolutionUrl: updates.videoSolutionUrl,
    notes: updates.notes,
  });

  if (!updated) {
    throw new NotFoundError('Question not found');
  }

  logger.info(`Question updated: id=${id}`);

  return formatQuestion(updated);
};

const deleteQuestion = async (id) => {
  const deleted = await questionsRepository.deleteById(id);
  if (!deleted) {
    throw new NotFoundError('Question not found');
  }

  logger.info(`Question deleted: id=${id}`);

  return { id: deleted.id };
};

const listTopics = async () => {
  return questionsRepository.findAllTopics();
};

const listPatterns = async () => {
  return questionsRepository.findAllPatterns();
};

const createTopic = async (name) => {
  const existing = await questionsRepository.findTopicByName(name);
  if (existing) {
    const { ConflictError } = require('../../errors/AppError');
    throw new ConflictError(`Topic "${name}" already exists`);
  }
  return questionsRepository.createTopic(name);
};

const createPattern = async (name) => {
  const existing = await questionsRepository.findPatternByName(name);
  if (existing) {
    const { ConflictError } = require('../../errors/AppError');
    throw new ConflictError(`Pattern "${name}" already exists`);
  }
  return questionsRepository.createPattern(name);
};

const startQuestion = async (userId, questionId) => {
  const existing = await questionsRepository.findById(questionId);
  if (!existing) {
    throw new NotFoundError('Question not found');
  }

  const current = await questionsRepository.findProgress(userId, questionId);
  
  // If already solved, do not downgrade status
  const newStatus = (current && current.status === 'SOLVED') ? 'SOLVED' : 'IN_PROGRESS';
  const startedAt = current && current.started_at ? current.started_at : new Date();

  const progress = await questionsRepository.upsertProgress(userId, questionId, {
    status: newStatus,
    startedAt,
  });

  logger.info(`User ${userId} started question ${questionId}`);
  return progress;
};

const markQuestionSolved = async (userId, questionId, leetcodeSubmissionUrl) => {
  const existing = await questionsRepository.findById(questionId);
  if (!existing) {
    throw new NotFoundError('Question not found');
  }

  const current = await questionsRepository.findProgress(userId, questionId);
  const startedAt = (current && current.started_at) ? current.started_at : new Date();
  
  const progress = await questionsRepository.upsertProgress(userId, questionId, {
    status: 'SOLVED',
    completedAt: new Date(),
    startedAt,
    leetcodeSubmissionUrl,
  });

  // Advance recommendations if any exist
  try {
    const recommendationsRepository = require('../recommendations/recommendations.repository');
    await recommendationsRepository.markAsCompleted(userId, questionId);
  } catch (err) {
    logger.warn(`Failed to mark recommendation completed on markQuestionSolved: ${err.message}`);
  }

  // Trigger Spaced Repetition / Revision Check
  try {
    const revisionService = require('../revision/revision.service');
    await revisionService.triggerRevisionCheck(userId, questionId);
  } catch (err) {
    logger.error(`Failed to trigger revision check on markQuestionSolved: ${err.message}`);
  }

  logger.info(`User ${userId} marked question ${questionId} as SOLVED`);
  return progress;
};

const toggleFavorite = async (userId, questionId) => {
  const existing = await questionsRepository.findById(questionId);
  if (!existing) {
    throw new NotFoundError('Question not found');
  }

  const current = await questionsRepository.findProgress(userId, questionId);
  const newFavorite = !(current && current.favorite);

  const progress = await questionsRepository.upsertProgress(userId, questionId, {
    favorite: newFavorite,
  });

  logger.info(`User ${userId} toggled favorite for question ${questionId} to ${newFavorite}`);
  return progress;
};

const updateNotes = async (userId, questionId, notes) => {
  const existing = await questionsRepository.findById(questionId);
  if (!existing) {
    throw new NotFoundError('Question not found');
  }

  const progress = await questionsRepository.upsertProgress(userId, questionId, {
    notes,
  });

  logger.info(`User ${userId} updated notes for question ${questionId}`);
  return progress;
};

const getUserProgress = async (userId) => {
  return await questionsRepository.getUserProgressList(userId);
};
const listCompanies = async () => {
  return questionsRepository.findAllCompanies();
};

module.exports = {
  listQuestions,
  getQuestionById,
  getQuestionBySlug,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  listTopics,
  listPatterns,
  createTopic,
  createPattern,
  startQuestion,
  markQuestionSolved,
  toggleFavorite,
  updateNotes,
  getUserProgress,
  listCompanies,
};
