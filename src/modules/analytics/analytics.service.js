const analyticsRepository = require('./analytics.repository');

const calculateStreak = (dates) => {
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Extract unique dates in YYYY-MM-DD format (already sorted DESC from repository)
  const uniqueDays = [...new Set(dates.map((d) => d.toISOString().split('T')[0]))];
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const hasSubmissionTodayOrYesterday = uniqueDays.includes(todayStr) || uniqueDays.includes(yesterdayStr);

  // 1. Calculate Longest Streak
  let prevDate = null;
  for (let i = 0; i < uniqueDays.length; i++) {
    const currentDate = new Date(uniqueDays[i]);
    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(prevDate - currentDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }
    prevDate = currentDate;
  }
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  // 2. Calculate Current Streak
  if (hasSubmissionTodayOrYesterday) {
    let consecutiveCount = 1;
    let checkDate = new Date(uniqueDays[0]);
    
    for (let i = 1; i < uniqueDays.length; i++) {
      const nextDate = new Date(uniqueDays[i]);
      const diffTime = Math.abs(checkDate - nextDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        consecutiveCount++;
        checkDate = nextDate;
      } else {
        break; // Streak broken
      }
    }
    currentStreak = consecutiveCount;
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return { currentStreak, longestStreak };
};

const getDashboardStats = async (userId) => {
  const [metrics, aiRating, submissionDates, difficulty, dailyActivity, monthlyActivity] = await Promise.all([
    analyticsRepository.getOverallMetrics(userId),
    analyticsRepository.getAverageAIRating(userId),
    analyticsRepository.getSubmissionDates(userId),
    analyticsRepository.getDifficultyDistribution(userId),
    analyticsRepository.getActivityGraph(userId, 'day', 7),
    analyticsRepository.getActivityGraph(userId, 'month', 6),
  ]);

  const { currentStreak, longestStreak } = calculateStreak(submissionDates);

  const totalAttempts = metrics.total_attempts;
  const acceptedAttempts = metrics.accepted_attempts;
  const acceptanceRate = totalAttempts > 0 ? (acceptedAttempts / totalAttempts) * 100 : 0.0;

  // Format difficulty distribution mapping
  const difficultyStats = {
    easy: { solved: 0, total: 0 },
    medium: { solved: 0, total: 0 },
    hard: { solved: 0, total: 0 },
  };

  difficulty.forEach((row) => {
    if (difficultyStats[row.difficulty]) {
      difficultyStats[row.difficulty] = {
        solved: row.completed_questions,
        total: row.total_questions,
      };
    }
  });

  return {
    questionsSolved: metrics.unique_solved,
    questionsAttempted: metrics.unique_attempted,
    totalAttempts,
    acceptanceRate: parseFloat(acceptanceRate.toFixed(2)),
    averageRuntime: parseFloat(parseFloat(metrics.avg_time || 0).toFixed(4)),
    averageMemory: parseFloat(parseFloat(metrics.avg_memory || 0).toFixed(2)),
    averageAIRating: parseFloat(aiRating.toFixed(1)),
    streak: {
      current: currentStreak,
      longest: longestStreak,
    },
    difficultyDistribution: difficultyStats,
    weeklyGraph: dailyActivity.map((row) => ({
      date: row.date_point.toISOString().split('T')[0],
      attempts: row.total_attempts,
      solved: row.accepted_attempts,
    })),
    monthlyGraph: monthlyActivity.map((row) => {
      const date = new Date(row.date_point);
      const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      return {
        month: label,
        attempts: row.total_attempts,
        solved: row.accepted_attempts,
      };
    }),
  };
};

const getTopicsStats = async (userId) => {
  const topics = await analyticsRepository.getTopicsCompletion(userId);
  return topics.map((row) => {
    const total = row.total_questions;
    const completed = row.completed_questions;
    const completionPercentage = total > 0 ? (completed / total) * 100 : 0.0;
    return {
      topicId: row.topic_id,
      topicName: row.topic_name,
      totalQuestions: total,
      completedQuestions: completed,
      completionPercentage: parseFloat(completionPercentage.toFixed(2)),
    };
  });
};

const getPatternsStats = async (userId) => {
  const patterns = await analyticsRepository.getPatternsCompletion(userId);
  return patterns.map((row) => {
    const total = row.total_questions;
    const completed = row.completed_questions;
    const completionPercentage = total > 0 ? (completed / total) * 100 : 0.0;
    return {
      patternId: row.pattern_id,
      patternName: row.pattern_name,
      totalQuestions: total,
      completedQuestions: completed,
      completionPercentage: parseFloat(completionPercentage.toFixed(2)),
    };
  });
};

module.exports = {
  getDashboardStats,
  getTopicsStats,
  getPatternsStats,
};
