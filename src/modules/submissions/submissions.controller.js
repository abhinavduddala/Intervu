const submissionsService = require('./submissions.service');

const createSubmission = async (req, res, next) => {
  try {
    const { questionId, sourceCode, languageId, stdin, expectedOutput } = req.body;
    const userId = req.user.id; // From authMiddleware

    const submission = await submissionsService.createSubmission({
      userId,
      questionId,
      sourceCode,
      languageId,
      stdin,
      expectedOutput,
    });

    res.status(202).json({
      success: true,
      data: {
        submissionId: submission.id,
        status: submission.statusDescription,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getSubmissionById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const submission = await submissionsService.getSubmissionDetails(id, req.user.id);

    res.status(200).json({
      success: true,
      data: { submission },
    });
  } catch (err) {
    next(err);
  }
};

const getSubmissionStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const submission = await submissionsService.getSubmissionStatus(id, req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: submission.id,
        statusId: submission.statusId,
        statusDescription: submission.statusDescription,
        executionTime: submission.executionTime,
        executionMemory: submission.executionMemory,
        stdout: submission.stdout,
        stderr: submission.stderr,
        compileOutput: submission.compileOutput,
        language: submission.language,
        passedCount: submission.passedCount,
        totalCount: submission.totalCount,
        testResults: submission.testResults,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getSubmissionHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await submissionsService.getSubmissionHistory(userId, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createSubmission,
  getSubmissionById,
  getSubmissionStatus,
  getSubmissionHistory,
};
