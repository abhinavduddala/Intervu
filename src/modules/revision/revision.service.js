const logger = require('../../utils/logger');
const db = require('../../config/db');
const revisionRepository = require('./revision.repository');
const submissionsRepository = require('../submissions/submissions.repository');
const aiRepository = require('../ai/ai.repository');
const questionsRepository = require('../questions/questions.repository');

const formatRevision = (row) => ({
  id: row.id,
  userId: row.user_id,
  questionId: row.question_id,
  questionTitle: row.question_title,
  questionDifficulty: row.question_difficulty,
  topicName: row.topic_name,
  patternName: row.pattern_name,
  revisionStage: row.revision_stage,
  nextRevisionDate: row.next_revision_date,
  lastRevisionDate: row.last_revision_date,
  revisionCount: row.revision_count,
  confidenceScore: row.confidence_score,
  reason: row.reason,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const calculateConfidenceScore = ({
  isAccepted,
  attemptsCount,
  aiRating,
  edgeCasesHandledRatio,
  executionTime,
  executionMemory,
}) => {
  if (!isAccepted) return 0;

  // 1. AI Interview Rating (max 30 points)
  let aiScore = 15; // default to middle
  if (aiRating !== undefined && aiRating !== null) {
    aiScore = (Number(aiRating) / 10) * 30;
  }

  // 2. Attempt efficiency (max 25 points)
  const attemptsScore = Math.max(0, 25 - (attemptsCount - 1) * 5);

  // 3. Edge Case Coverage (max 20 points)
  let edgeCaseScore = 10; // default
  if (edgeCasesHandledRatio !== undefined && edgeCasesHandledRatio !== null) {
    edgeCaseScore = edgeCasesHandledRatio * 20;
  }

  // 4. Execution Performance (max 25 points)
  // Runtime: O(1) or very fast (<= 0.1s) gets full points
  const time = executionTime ? parseFloat(executionTime) : 0;
  const runtimeScore = Math.max(0, 12.5 - time * 10);

  // Memory: Very low memory usage gets full points (e.g. <= 10MB/10000KB)
  const mem = executionMemory ? Number(executionMemory) : 0;
  const memoryScore = Math.max(0, 12.5 - (mem / 10000) * 2);

  const total = aiScore + attemptsScore + edgeCaseScore + runtimeScore + memoryScore;
  return Math.min(100, Math.max(0, Math.round(total)));
};

const calculateNextInterval = (stage, confidenceScore) => {
  const intervals = {
    1: 1,
    2: 3,
    3: 7,
    4: 15,
    5: 30,
  };
  const baseDays = intervals[stage] || 1;
  const multiplier = 0.5 + (confidenceScore / 100) * 0.7; // 0.5 to 1.2
  return Math.max(1, Math.round(baseDays * multiplier));
};

const triggerRevisionCheck = async (userId, questionId) => {
  logger.info(`Evaluating revision triggers for userId=${userId}, questionId=${questionId}`);

  // Fetch solved status from user progress
  const progress = await questionsRepository.findProgress(userId, questionId);
  if (!progress || progress.status !== 'SOLVED') {
    logger.info(`User=${userId} has not solved questionId=${questionId} successfully yet. Skipping revision check.`);
    return null;
  }

  // Get the latest solution submission to link to AI feedback
  const latestSubQuery = await db.query(
    `SELECT id FROM submissions 
     WHERE user_id = $1 AND question_id = $2 
     ORDER BY created_at DESC LIMIT 1`,
    [userId, questionId]
  );
  const latestAccepted = latestSubQuery.rows[0];
  const attemptsCount = latestAccepted ? 1 : 0;

  let aiRating = null;
  let edgeCasesHandledRatio = null;

  if (latestAccepted) {
    const latestAnalysis = await aiRepository.findBySubmissionId(latestAccepted.id);
    if (latestAnalysis) {
      const feedback = typeof latestAnalysis.interview_feedback === 'string' 
        ? JSON.parse(latestAnalysis.interview_feedback) 
        : latestAnalysis.interview_feedback;
      aiRating = feedback?.rating;

      const edgeCases = typeof latestAnalysis.edge_cases === 'string'
        ? JSON.parse(latestAnalysis.edge_cases)
        : latestAnalysis.edge_cases || [];

      if (edgeCases.length > 0) {
        const handled = edgeCases.filter((ec) => {
          const text = String(ec).toLowerCase();
          return text.includes('handled') || text.includes('correctly') || text.includes('passed');
        }).length;
        edgeCasesHandledRatio = handled / edgeCases.length;
      }
    }
  }

  const confidenceScore = calculateConfidenceScore({
    isAccepted: true,
    attemptsCount: progress.revision_count + 1,
    aiRating,
    edgeCasesHandledRatio,
    executionTime: null,
    executionMemory: null,
  });

  // Evaluate Revision Triggers
  let triggerMatched = true;
  let reason = 'Solved problem on LeetCode';

  if (progress.revision_count === 0) {
    reason = 'Solved for the first time';
  } else if (aiRating !== null && aiRating < 6) {
    reason = 'AI detected weak understanding';
  }

  if (triggerMatched) {
    const nextIntervalDays = calculateNextInterval(1, confidenceScore);
    const nextRevisionDate = new Date();
    nextRevisionDate.setDate(nextRevisionDate.getDate() + nextIntervalDays);

    logger.info(`Trigger matched: "${reason}". Upserting revision queue for user=${userId}, question=${questionId} with confidence=${confidenceScore}`);
    
    return await revisionRepository.upsert({
      userId,
      questionId,
      revisionStage: 1,
      nextRevisionDate,
      confidenceScore,
      reason,
      status: 'active',
    });
  }

  return null;
};

const processLongPeriodTriggers = async (userId) => {
  const missing = await revisionRepository.findUserSolvedQuestionsMissingRevision(userId);
  if (missing.length === 0) return;

  logger.info(`Found ${missing.length} solved questions with long inactive practice periods. Adding to revision queue.`);

  for (const q of missing) {
    const confidenceScore = 50; 
    const nextRevisionDate = new Date();
    nextRevisionDate.setDate(nextRevisionDate.getDate() + 1); // schedule for tomorrow

    await revisionRepository.upsert({
      userId,
      questionId: q.id,
      revisionStage: 1,
      nextRevisionDate,
      confidenceScore,
      reason: 'Long period without practice',
      status: 'active',
    });
  }
};

const getTodayRevisions = async (userId) => {
  await processLongPeriodTriggers(userId);
  const rows = await revisionRepository.findActiveRevisionsToday(userId);
  return rows.map(formatRevision);
};

const getUpcomingRevisions = async (userId) => {
  await processLongPeriodTriggers(userId);
  const rows = await revisionRepository.findActiveRevisionsUpcoming(userId, 30);
  return rows.map(formatRevision);
};

const completeRevision = async (userId, questionId) => {
  const item = await revisionRepository.findByUserAndQuestion(userId, questionId);
  if (!item) {
    throw new NotFoundError('Revision schedule not found for this question');
  }

  const newStage = Math.min(5, item.revision_stage + 1);
  const nextIntervalDays = calculateNextInterval(newStage, item.confidence_score);
  
  const nextRevisionDate = new Date();
  nextRevisionDate.setDate(nextRevisionDate.getDate() + nextIntervalDays);

  const updated = await revisionRepository.update(item.id, {
    revisionStage: newStage,
    nextRevisionDate,
    lastRevisionDate: new Date(),
    revisionCount: item.revision_count + 1,
    status: 'active',
  });

  logger.info(`Revision completed: user=${userId}, question=${questionId}. Advanced to stage ${newStage}. Next date: ${nextRevisionDate}`);
  return formatRevision(updated);
};

const resetRevision = async (userId, questionId) => {
  const item = await revisionRepository.findByUserAndQuestion(userId, questionId);
  if (!item) {
    throw new NotFoundError('Revision schedule not found for this question');
  }

  const nextRevisionDate = new Date();
  nextRevisionDate.setDate(nextRevisionDate.getDate() + 1); // Reset back to 1 day interval

  const updated = await revisionRepository.update(item.id, {
    revisionStage: 1,
    nextRevisionDate,
    confidenceScore: Math.max(0, item.confidence_score - 20), 
    revisionCount: item.revision_count + 1,
    status: 'active',
  });

  logger.info(`Revision schedule reset for user=${userId}, question=${questionId}. Dropped back to Stage 1.`);
  return formatRevision(updated);
};

const getDashboardIntegration = async (userId) => {
  await processLongPeriodTriggers(userId);
  const stats = await revisionRepository.getRevisionStats(userId);
  const upcoming = await revisionRepository.findActiveRevisionsUpcoming(userId, 30);

  const calendarMap = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    calendarMap[dateStr] = 0;
  }

  upcoming.forEach((row) => {
    const dateStr = new Date(row.next_revision_date).toISOString().split('T')[0];
    if (calendarMap[dateStr] !== undefined) {
      calendarMap[dateStr]++;
    }
  });

  const calendar = Object.keys(calendarMap).map((date) => ({
    date,
    count: calendarMap[date],
  }));

  return {
    todayCount: stats.todayCount,
    overdueCount: stats.overdueCount,
    upcomingCount: stats.upcomingCount,
    calendar,
  };
};

module.exports = {
  calculateConfidenceScore,
  calculateNextInterval,
  triggerRevisionCheck,
  processLongPeriodTriggers,
  getTodayRevisions,
  getUpcomingRevisions,
  completeRevision,
  resetRevision,
  getDashboardIntegration,
};
