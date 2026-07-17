const logger = require('../../utils/logger');
const recommendationsRepository = require('./recommendations.repository');
const companyService = require('../company/company.service');
const analyticsService = require('../analytics/analytics.service');
const userService = require('../user/user.service');
const questionsRepository = require('../questions/questions.repository');

const formatRecommendation = (row) => ({
  id: row.id,
  userId: row.user_id,
  questionId: row.question_id,
  questionTitle: row.question_title,
  questionDifficulty: row.question_difficulty,
  topicName: row.topic_name,
  patternName: row.pattern_name,
  recommendationType: row.recommendation_type,
  priority: row.priority,
  score: parseFloat(parseFloat(row.score).toFixed(2)),
  reason: row.reason,
  generatedAt: row.generated_at,
  expiresAt: row.expires_at,
  completed: row.completed,
});

const generateRecommendations = async (userId) => {
  logger.info(`Starting recommendations generation for userId=${userId}`);
  
  // Clear any existing active (uncompleted and unexpired) recommendations first
  await recommendationsRepository.clearActiveRecommendations(userId);

  const candidates = [];

  // 1. Fetch User Profiles & Targets
  let targets = { targetCompanies: [] };
  try {
    targets = await userService.getTargets(userId);
  } catch (err) {
    logger.warn(`Could not load user targets for recommendations: ${err.message}`);
  }

  // 2. Fetch User Analytics Completion
  const topicsStats = await analyticsService.getTopicsStats(userId);
  const patternsStats = await analyticsService.getPatternsStats(userId);
  
  // 3. Rule A: Target Company Readiness
  if (targets.targetCompanies && targets.targetCompanies.length > 0) {
    for (const company of targets.targetCompanies) {
      try {
        const readiness = await companyService.getCompanyReadinessDetail(userId, company);
        if (readiness.readiness < 80.0) {
          // Identify recommended topics for this company track
          if (readiness.recommendedTopics && readiness.recommendedTopics.length > 0) {
            const unsolvedQuestions = await recommendationsRepository.getUnsolvedQuestionsInTopics(
              userId,
              readiness.recommendedTopics
            );

            unsolvedQuestions.forEach((q) => {
              candidates.push({
                question: q,
                type: 'Company Readiness',
                score: 90.0 - readiness.readiness, // Higher priority for lower readiness
                priority: 1,
                reason: `${company} readiness requires stronger ${q.topic_name} skills.`,
              });
            });
          }
        }
      } catch (err) {
        logger.error(`Error processing company readiness for recommendations: ${err.message}`);
      }
    }
  }

  // 4. Rule B: Weak Topics (< 50% completion)
  const weakTopicsList = topicsStats.filter((t) => t.completionPercentage < 50.0);
  if (weakTopicsList.length > 0) {
    const weakTopicNames = weakTopicsList.map((t) => t.topicName);
    const unsolvedQuestions = await recommendationsRepository.getUnsolvedQuestionsInTopics(
      userId,
      weakTopicNames
    );

    unsolvedQuestions.forEach((q) => {
      const topicStat = weakTopicsList.find((t) => t.topicName.toLowerCase() === q.topic_name.toLowerCase());
      const compPct = topicStat ? topicStat.completionPercentage : 0.0;
      candidates.push({
        question: q,
        type: 'Weak Topic',
        score: 80.0 - compPct,
        priority: 2,
        reason: `You have solved only ${compPct.toFixed(0)}% of ${q.topic_name} problems.`,
      });
    });
  }

  // 5. Rule C: Weak Patterns (< 50% completion)
  const weakPatternsList = patternsStats.filter((p) => p.completionPercentage < 50.0);
  if (weakPatternsList.length > 0) {
    const weakPatternNames = weakPatternsList.map((p) => p.patternName);
    const unsolvedQuestions = await recommendationsRepository.getUnsolvedQuestionsInPatterns(
      userId,
      weakPatternNames
    );

    unsolvedQuestions.forEach((q) => {
      const patternStat = weakPatternsList.find((p) => p.patternName.toLowerCase() === q.pattern_name.toLowerCase());
      const compPct = patternStat ? patternStat.completionPercentage : 0.0;
      candidates.push({
        question: q,
        type: 'Weak Pattern',
        score: 75.0 - compPct,
        priority: 3,
        reason: `You have solved only ${compPct.toFixed(0)}% of problems in pattern "${q.pattern_name}".`,
      });
    });
  }

  // 6. Rule D: Spaced Repetition / Revision
  const revisionCandidates = await recommendationsRepository.getRevisionCandidates(userId);
  revisionCandidates.forEach((row) => {
    const lastSolved = new Date(row.last_solved_at);
    const daysSinceLastSolved = Math.max(1, Math.floor((Date.now() - lastSolved.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (daysSinceLastSolved >= 7) {
      candidates.push({
        question: row,
        type: 'Revision',
        score: 50.0 + Math.min(20, daysSinceLastSolved), // Priorities older reviews
        priority: 4,
        reason: `You haven't practiced ${row.topic_name} for ${daysSinceLastSolved} days.`,
      });
    }
  });

  // 7. Rule E: AI Recommendation / Struggled Problems
  const struggledQuestions = await recommendationsRepository.getQuestionsStruggledWith(userId);
  for (const q of struggledQuestions) {
    // Recommend an unsolved question in the same topic to practice boundary conditions
    const relatedUnsolved = await recommendationsRepository.getUnsolvedQuestionsInTopics(userId, [q.topic_name]);
    if (relatedUnsolved.length > 0) {
      candidates.push({
        question: relatedUnsolved[0],
        type: 'AI Recommendation',
        score: 70.0,
        priority: 3,
        reason: `You missed edge cases in your previous submissions for "${q.title}". Practice this boundary-condition problem in ${q.topic_name}.`,
      });
    }
  }

  // 8. Fallback: If candidates list is empty (e.g. user solved everything recommended or no topics weak), recommend any unsolved question
  if (candidates.length === 0) {
    const allQuestions = await questionsRepository.findAll({ page: 1, limit: 100 });
    const solvedIdsResult = await db.query(
      `SELECT DISTINCT question_id FROM submissions WHERE user_id = $1 AND status_id = 3`,
      [userId]
    );
    const solvedIds = new Set(solvedIdsResult.rows.map((row) => row.question_id));
    const unsolved = allQuestions.filter((q) => !solvedIds.has(q.id));

    unsolved.forEach((q) => {
      candidates.push({
        question: q,
        type: 'Daily Goal',
        score: 50.0,
        priority: 5,
        reason: `Practice this ${q.difficulty} problem to maintain consistency and grow your streak!`,
      });
    });
  }

  // Sort and Deduplicate
  // If a question is recommended for multiple reasons, we keep the one with the highest priority (lowest priority number / highest score)
  const dedupedMap = {};
  candidates.forEach((cand) => {
    const qId = cand.question.id;
    const existing = dedupedMap[qId];
    if (!existing || cand.priority < existing.priority || (cand.priority === existing.priority && cand.score > existing.score)) {
      dedupedMap[qId] = cand;
    }
  });

  const finalCandidates = Object.values(dedupedMap);
  // Sort by priority (1 is highest) and then score DESC
  finalCandidates.sort((a, b) => a.priority - b.priority || b.score - a.score);

  // Take top 4 recommendations
  const topRecommendations = finalCandidates.slice(0, 4);

  const savedList = [];
  for (const item of topRecommendations) {
    const saved = await recommendationsRepository.create({
      userId,
      questionId: item.question.id,
      recommendationType: item.type,
      priority: item.priority,
      score: item.score,
      reason: item.reason,
    });
    savedList.push(formatRecommendation(saved));
  }

  logger.info(`Generated and cached ${savedList.length} recommendations for userId=${userId}`);
  return savedList;
};

const getDailyRecommendations = async (userId) => {
  const active = await recommendationsRepository.findActiveRecommendations(userId);
  if (active.length > 0) {
    return active.map(formatRecommendation);
  }
  // Generate fresh if none are active/unexpired
  return generateRecommendations(userId);
};

const getDailyStudyPlan = async (userId) => {
  const recommendations = await getDailyRecommendations(userId);
  
  // Aggregate plan by topic counts
  const planAgg = {};
  let totalTimeMinutes = 0;

  recommendations.forEach((item) => {
    // If it's a revision recommendation, label as Revision, otherwise use topic name
    const category = item.recommendationType === 'Revision' ? 'Revision' : item.topicName;
    planAgg[category] = (planAgg[category] || 0) + 1;

    // Estimate time based on difficulty (Easy=15m, Medium=30m, Hard=45m)
    const diff = item.questionDifficulty?.toLowerCase() || 'medium';
    if (diff === 'easy') totalTimeMinutes += 15;
    else if (diff === 'hard') totalTimeMinutes += 45;
    else totalTimeMinutes += 30; // default medium
  });

  const planList = Object.keys(planAgg).map((key) => ({
    topic: key,
    count: planAgg[key],
  }));

  // Estimate hours nicely
  let estimatedTime = '30 minutes';
  if (totalTimeMinutes > 0) {
    const hours = totalTimeMinutes / 60;
    if (hours < 1) {
      estimatedTime = `${totalTimeMinutes} minutes`;
    } else {
      const roundedHours = Math.round(hours * 2) / 2; // round to nearest 0.5
      estimatedTime = `${roundedHours} hour${roundedHours > 1 ? 's' : ''}`;
    }
  }

  return {
    plan: planList,
    estimatedTime,
    recommendations,
  };
};

const getCompanyRecommendations = async (userId, companyName) => {
  // Directly pull detailed company indicators
  const readiness = await companyService.getCompanyReadinessDetail(userId, companyName);
  
  // Fetch unsolved questions for the recommended topics
  const unsolved = await recommendationsRepository.getUnsolvedQuestionsInTopics(
    userId,
    readiness.recommendedTopics
  );

  return unsolved.map((q, idx) => ({
    questionId: q.id,
    questionTitle: q.title,
    questionDifficulty: q.difficulty,
    topicName: q.topic_name,
    patternName: q.pattern_name,
    recommendationType: 'Company Readiness',
    priority: 1,
    reason: `${companyName} track requires practicing ${q.topic_name} problems.`,
  }));
};

const refreshRecommendations = async (userId) => {
  return generateRecommendations(userId);
};

module.exports = {
  getDailyRecommendations,
  getDailyStudyPlan,
  getCompanyRecommendations,
  refreshRecommendations,
};
