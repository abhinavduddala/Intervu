const questionsService = require('./questions.service');
const { clearKeysByPattern } = require('../../config/redis');

const listQuestions = async (req, res, next) => {
  try {
    const result = await questionsService.listQuestions(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getQuestionById = async (req, res, next) => {
  try {
    const question = await questionsService.getQuestionById(Number(req.params.id));

    res.status(200).json({
      success: true,
      data: { question },
    });
  } catch (err) {
    next(err);
  }
};

const getQuestionBySlug = async (req, res, next) => {
  try {
    const question = await questionsService.getQuestionBySlug(req.params.slug);

    res.status(200).json({
      success: true,
      data: { question },
    });
  } catch (err) {
    next(err);
  }
};

const createQuestion = async (req, res, next) => {
  try {
    const question = await questionsService.createQuestion(req.body);

    // Invalidate cached lists/details
    clearKeysByPattern('cache:/api/v1/questions*').catch(err => {});

    res.status(201).json({
      success: true,
      data: { question },
    });
  } catch (err) {
    next(err);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const question = await questionsService.updateQuestion(Number(req.params.id), req.body);

    // Invalidate cached lists/details
    clearKeysByPattern('cache:/api/v1/questions*').catch(err => {});

    res.status(200).json({
      success: true,
      data: { question },
    });
  } catch (err) {
    next(err);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const result = await questionsService.deleteQuestion(Number(req.params.id));

    // Invalidate cached lists/details
    clearKeysByPattern('cache:/api/v1/questions*').catch(err => {});

    res.status(200).json({
      success: true,
      data: result,
      message: 'Question deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const listTopics = async (req, res, next) => {
  try {
    const topics = await questionsService.listTopics();

    res.status(200).json({
      success: true,
      data: { topics },
    });
  } catch (err) {
    next(err);
  }
};

const listPatterns = async (req, res, next) => {
  try {
    const patterns = await questionsService.listPatterns();

    res.status(200).json({
      success: true,
      data: { patterns },
    });
  } catch (err) {
    next(err);
  }
};

const createTopic = async (req, res, next) => {
  try {
    const topic = await questionsService.createTopic(req.body.name);

    res.status(201).json({
      success: true,
      data: { topic },
    });
  } catch (err) {
    next(err);
  }
};

const createPattern = async (req, res, next) => {
  try {
    const pattern = await questionsService.createPattern(req.body.name);

    res.status(201).json({
      success: true,
      data: { pattern },
    });
  } catch (err) {
    next(err);
  }
};

const startQuestion = async (req, res, next) => {
  try {
    const progress = await questionsService.startQuestion(req.user.id, Number(req.params.id));
    res.status(200).json({
      success: true,
      data: { progress },
    });
  } catch (err) {
    next(err);
  }
};

const markSolved = async (req, res, next) => {
  try {
    const progress = await questionsService.markQuestionSolved(
      req.user.id,
      Number(req.params.id),
      req.body.leetcodeSubmissionUrl
    );
    res.status(200).json({
      success: true,
      data: { progress },
    });
  } catch (err) {
    next(err);
  }
};

const toggleFavorite = async (req, res, next) => {
  try {
    const progress = await questionsService.toggleFavorite(req.user.id, Number(req.params.id));
    res.status(200).json({
      success: true,
      data: { progress },
    });
  } catch (err) {
    next(err);
  }
};

const updateNotes = async (req, res, next) => {
  try {
    const progress = await questionsService.updateNotes(
      req.user.id,
      Number(req.params.id),
      req.body.notes
    );
    res.status(200).json({
      success: true,
      data: { progress },
    });
  } catch (err) {
    next(err);
  }
};

const getProgressList = async (req, res, next) => {
  try {
    const progress = await questionsService.getUserProgress(req.user.id);
    res.status(200).json({
      success: true,
      data: { progress },
    });
  } catch (err) {
    next(err);
  }
};

const listCompanies = async (req, res, next) => {
  try {
    const companies = await questionsService.listCompanies();

    res.status(200).json({
      success: true,
      data: { companies },
    });
  } catch (err) {
    next(err);
  }
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
  markSolved,
  toggleFavorite,
  updateNotes,
  getProgressList,
  listCompanies,
};
