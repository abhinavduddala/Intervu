const aiService = require('./ai.service');

const analyzeSolution = async (req, res, next) => {
  try {
    const { questionId, language, code } = req.body;
    const userId = req.user.id;

    const result = await aiService.analyzePastedSolution(userId, questionId, { 
      sourceCode: code, 
      language 
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getAnalysisDetails = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;

    const analysis = await aiService.getAnalysisById(id, userId);

    res.status(200).json({
      success: true,
      data: { analysis },
    });
  } catch (err) {
    next(err);
  }
};

const getUserHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const history = await aiService.getHistory(userId);

    res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (err) {
    next(err);
  }
};

const getQuestionHistory = async (req, res, next) => {
  try {
    const questionId = Number(req.params.questionId);
    const userId = req.user.id;

    const history = await aiService.getQuestionHistory(userId, questionId);

    res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (err) {
    next(err);
  }
};

// Legacy paste solution endpoint mapping (for backward compatibility)
const pasteSolution = async (req, res, next) => {
  try {
    const questionId = Number(req.params.id);
    const { sourceCode, language } = req.body;
    const userId = req.user.id;

    const result = await aiService.analyzePastedSolution(userId, questionId, { 
      sourceCode, 
      language 
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  analyzeSolution,
  getAnalysisDetails,
  getUserHistory,
  getQuestionHistory,
  pasteSolution,
};
