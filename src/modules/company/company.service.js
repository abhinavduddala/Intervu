const companyRepository = require('./company.repository');
const analyticsRepository = require('../analytics/analytics.repository');
const logger = require('../../utils/logger');
const { NotFoundError } = require('../../errors/AppError');

const DEFAULT_COMPANY_EXPECTATIONS = {
  Amazon: {
    weights: { Trees: 0.30, Arrays: 0.25, Graphs: 0.20, Stacks: 0.15, 'Linked Lists': 0.10 },
    difficulty: { easy: 0.20, medium: 0.60, hard: 0.20 },
    patterns: ['Sliding Window', 'Two Pointers', 'DFS/BFS', 'Heaps'],
  },
  Google: {
    weights: { Graphs: 0.35, 'Dynamic Programming': 0.30, Trees: 0.20, Arrays: 0.15 },
    difficulty: { easy: 0.10, medium: 0.50, hard: 0.40 },
    patterns: ['Recursion', 'DFS/BFS', 'Binary Search', 'Backtracking'],
  },
  Microsoft: {
    weights: { Arrays: 0.30, Trees: 0.25, Stacks: 0.20, Queues: 0.15, Graphs: 0.10 },
    difficulty: { easy: 0.20, medium: 0.60, hard: 0.20 },
    patterns: ['Binary Search', 'Two Pointers', 'Stacks', 'Recursion'],
  },
  Uber: {
    weights: { Graphs: 0.40, 'Dynamic Programming': 0.30, Arrays: 0.15, Heap: 0.15 },
    difficulty: { easy: 0.05, medium: 0.55, hard: 0.40 },
    patterns: ['Graphs', 'Dijkstra', 'Heaps', 'Sliding Window'],
  },
  Qualcomm: {
    weights: { Arrays: 0.40, Stacks: 0.30, Recursion: 0.20, Graphs: 0.10 },
    difficulty: { easy: 0.40, medium: 0.50, hard: 0.10 },
    patterns: ['Arrays', 'Two Pointers', 'Recursion'],
  },
  'Goldman Sachs': {
    weights: { Arrays: 0.30, 'Dynamic Programming': 0.30, Recursion: 0.20, Trees: 0.20 },
    difficulty: { easy: 0.20, medium: 0.60, hard: 0.20 },
    patterns: ['Hash Tables', 'Binary Search', 'Sliding Window'],
  },
  Atlassian: {
    weights: { Stacks: 0.30, Queues: 0.30, Arrays: 0.20, Trees: 0.20 },
    difficulty: { easy: 0.15, medium: 0.70, hard: 0.15 },
    patterns: ['Stacks', 'Hash Tables', 'Queues'],
  },
  Meta: {
    weights: { Arrays: 0.35, Trees: 0.25, Graphs: 0.20, 'Linked Lists': 0.20 },
    difficulty: { easy: 0.20, medium: 0.70, hard: 0.10 },
    patterns: ['Two Pointers', 'Sliding Window', 'DFS/BFS'],
  },
  Netflix: {
    weights: { Arrays: 0.35, 'Dynamic Programming': 0.25, Graphs: 0.20, Stacks: 0.20 },
    difficulty: { easy: 0.10, medium: 0.70, hard: 0.20 },
    patterns: ['Hash Tables', 'Heaps', 'Sliding Window'],
  },
};

const getCompaniesList = () => Object.keys(DEFAULT_COMPANY_EXPECTATIONS);

const formatReadiness = (row) => ({
  id: row.id,
  userId: row.user_id,
  companyName: row.company_name,
  readinessScore: parseFloat(parseFloat(row.readiness_score).toFixed(1)),
  strengths: typeof row.strengths === 'string' ? JSON.parse(row.strengths) : row.strengths,
  weakTopics: typeof row.weak_topics === 'string' ? JSON.parse(row.weak_topics) : row.weak_topics,
  lastUpdated: row.last_updated,
});

const calculateUserPerformance = async (userId) => {
  const [
    overall,
    aiRating,
    completedTopics,
    completedPatterns,
    difficultyStats,
    totalTopicsCount,
    totalPatternsCount,
  ] = await Promise.all([
    analyticsRepository.getOverallMetrics(userId),
    analyticsRepository.getAverageAIRating(userId),
    companyRepository.getCompletedCountByTopic(userId),
    companyRepository.getCompletedCountByPattern(userId),
    companyRepository.getSolvedCountByDifficulty(userId),
    companyRepository.getTopicQuestionsCount(),
    companyRepository.getPatternQuestionsCount(),
  ]);

  const totalAttempts = overall.total_attempts;
  const acceptedAttempts = overall.accepted_attempts;
  const acceptanceRate = totalAttempts > 0 ? acceptedAttempts / totalAttempts : 0.0;

  // Convert array rows to quick-access lookup maps
  const topicMap = {};
  totalTopicsCount.forEach((row) => {
    topicMap[row.topic_name.toLowerCase()] = { total: row.total, completed: 0 };
  });
  completedTopics.forEach((row) => {
    const key = row.topic_name.toLowerCase();
    if (topicMap[key]) {
      topicMap[key].completed = row.completed;
    }
  });

  const patternMap = {};
  totalPatternsCount.forEach((row) => {
    patternMap[row.pattern_name.toLowerCase()] = { total: row.total, completed: 0 };
  });
  completedPatterns.forEach((row) => {
    const key = row.pattern_name.toLowerCase();
    if (patternMap[key]) {
      patternMap[key].completed = row.completed;
    }
  });

  const difficultyMap = { easy: 0, medium: 0, hard: 0 };
  difficultyStats.forEach((row) => {
    difficultyMap[row.difficulty] = row.completed;
  });

  return {
    totalSolved: overall.unique_solved,
    acceptanceRate,
    averageAIRating: aiRating || 5.0, // Default to midpoint baseline if no reviews logged
    topicMap,
    patternMap,
    difficultyMap,
  };
};

const calculateSingleCompanyReadiness = async (userId, companyName, performance) => {
  const expectations = DEFAULT_COMPANY_EXPECTATIONS[companyName];
  if (!expectations) {
    throw new NotFoundError(`Expectation matrix not configured for company "${companyName}"`);
  }

  // 1. Fetch weights from DB (fallback to default config if empty)
  const dbWeights = await companyRepository.getTopicWeights(companyName);
  const weights = {};
  
  if (dbWeights.length > 0) {
    dbWeights.forEach((row) => {
      weights[row.topic_name] = parseFloat(row.weight);
    });
  } else {
    Object.assign(weights, expectations.weights);
  }

  // Calculate Topic Mastery (40% contribution)
  let topicMasteryScore = 0.0;
  const strengths = [];
  const weakTopics = [];
  const recommendedTopics = [];

  const weightKeys = Object.keys(weights);
  weightKeys.forEach((topic) => {
    const key = topic.toLowerCase();
    const topicData = performance.topicMap[key] || { total: 0, completed: 0 };
    const completionRate = topicData.total > 0 ? topicData.completed / topicData.total : 0.0;

    topicMasteryScore += completionRate * weights[topic];

    if (completionRate >= 0.7) {
      strengths.push(`${topic} Mastery`);
    } else if (completionRate < 0.5) {
      weakTopics.push(topic);
      recommendedTopics.push({ topic, weight: weights[topic] });
    }
  });
  
  // Normalize topic mastery contribution
  const topicMasteryWeightSum = weightKeys.reduce((sum, k) => sum + weights[k], 0) || 1;
  const topicMasteryContribution = (topicMasteryScore / topicMasteryWeightSum) * 40;

  // Calculate Pattern Coverage (20% contribution)
  let patternScoreSum = 0.0;
  const recommendedPatterns = [];

  expectations.patterns.forEach((pattern) => {
    const key = pattern.toLowerCase();
    const patternData = performance.patternMap[key] || { total: 0, completed: 0 };
    const completionRate = patternData.total > 0 ? patternData.completed / patternData.total : 0.0;

    patternScoreSum += completionRate;

    if (completionRate >= 0.7) {
      strengths.push(`${pattern} Pattern`);
    } else if (completionRate < 0.5) {
      recommendedPatterns.push(pattern);
    }
  });
  
  const patternContribution = (patternScoreSum / (expectations.patterns.length || 1)) * 20;

  // Calculate Difficulty Solved (20% contribution)
  let difficultyContribution = 0.0;
  const totalSolved = performance.totalSolved;

  if (totalSolved > 0) {
    let easyRatioMet = 0.0;
    let mediumRatioMet = 0.0;
    let hardRatioMet = 0.0;

    const easyRatio = performance.difficultyMap.easy / totalSolved;
    const mediumRatio = performance.difficultyMap.medium / totalSolved;
    const hardRatio = performance.difficultyMap.hard / totalSolved;

    if (expectations.difficulty.easy > 0) {
      easyRatioMet = Math.min(1.0, easyRatio / expectations.difficulty.easy);
    }
    if (expectations.difficulty.medium > 0) {
      mediumRatioMet = Math.min(1.0, mediumRatio / expectations.difficulty.medium);
    }
    if (expectations.difficulty.hard > 0) {
      hardRatioMet = Math.min(1.0, hardRatio / expectations.difficulty.hard);
    }

    const weightedDiff = (easyRatioMet * 0.20) + (mediumRatioMet * 0.50) + (hardRatioMet * 0.30);
    
    // Scale by problem volume count to reward practice counts (max score reached at 10 solved questions)
    const volumeScaling = Math.min(1.0, totalSolved / 10);
    difficultyContribution = weightedDiff * volumeScaling * 20;
  }

  // Calculate Acceptance Rate Score (10% contribution)
  const acceptanceContribution = performance.acceptanceRate * 10;

  // Calculate AI Review Score (10% contribution)
  // Maps standard 0-10 rating directly to 0-10 score contribution points
  const aiContribution = performance.averageAIRating;

  // Calculate total compiled readiness
  const totalReadinessScore = Math.min(
    100.0,
    topicMasteryContribution + patternContribution + difficultyContribution + acceptanceContribution + aiContribution
  );

  // Sort recommendation lists by priority importance
  recommendedTopics.sort((a, b) => b.weight - a.weight);
  const finalRecommendedTopics = recommendedTopics.slice(0, 2).map((t) => t.topic);
  const finalRecommendedPatterns = recommendedPatterns.slice(0, 2);

  // Save/Cache calculation results to PostgreSQL
  const saved = await companyRepository.saveReadiness({
    userId,
    companyName,
    score: parseFloat(totalReadinessScore.toFixed(2)),
    strengths: strengths.slice(0, 3), // Return up to top 3 strengths
    weakTopics: weakTopics.slice(0, 3),
  });

  return {
    company: companyName,
    readiness: parseFloat(totalReadinessScore.toFixed(1)),
    strengths: strengths.slice(0, 3),
    weakTopics: weakTopics.slice(0, 3),
    recommendedTopics: finalRecommendedTopics,
    recommendedPatterns: finalRecommendedPatterns,
  };
};

const calculateAndCacheAllCompanies = async (userId) => {
  const performance = await calculateUserPerformance(userId);
  const companies = getCompaniesList();
  
  const results = [];
  for (const company of companies) {
    const res = await calculateSingleCompanyReadiness(userId, company, performance);
    results.push(res);
  }
  return results;
};

const getCompanyReadiness = async (userId) => {
  // Re-calculate and cache to ensure accuracy
  const results = await calculateAndCacheAllCompanies(userId);
  return results;
};

const getCompanyReadinessDetail = async (userId, companyName) => {
  const normalizedName = getCompaniesList().find(
    (name) => name.toLowerCase() === companyName.toLowerCase()
  );

  if (!normalizedName) {
    throw new NotFoundError(`Company "${companyName}" is not supported by PrepPilot`);
  }

  const performance = await calculateUserPerformance(userId);
  return calculateSingleCompanyReadiness(userId, normalizedName, performance);
};

module.exports = {
  getCompaniesList,
  getCompanyReadiness,
  getCompanyReadinessDetail,
};
