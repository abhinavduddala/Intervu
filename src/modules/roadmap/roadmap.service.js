const roadmapRepository = require('./roadmap.repository');

const getRoadmap = async (userId) => {
  const rows = await roadmapRepository.getRoadmapData(userId);

  const totalQuestions = rows.length;
  const completedQuestions = rows.filter(r => r.progress_status === 'SOLVED').length;
  const inProgressQuestions = rows.filter(r => r.progress_status === 'IN_PROGRESS').length;
  
  const completionPercentage = totalQuestions > 0 
    ? Math.round((completedQuestions / totalQuestions) * 100) 
    : 0;

  // Current question is the first question in sorted order that is not solved
  const currentQuestionRow = rows.find(r => r.progress_status !== 'SOLVED');

  // Group by topic
  const stagesMap = {};
  
  rows.forEach((row) => {
    const topicName = row.topic_name;
    if (!stagesMap[topicName]) {
      stagesMap[topicName] = {
        id: row.topic_id.toString(),
        title: topicName,
        minOrder: row.learning_order !== null && row.learning_order !== undefined ? row.learning_order : 999999,
        questions: [],
      };
    }
    stagesMap[topicName].questions.push({
      id: row.id,
      title: row.title,
      slug: row.slug,
      difficulty: row.difficulty,
      topic: row.topic_name,
      pattern: row.pattern_name,
      leetcodeUrl: row.leetcode_url || row.source_url,
      status: row.progress_status || 'NOT_STARTED',
    });
  });

  // Convert to sorted array based on the first question's learning_order in that stage
  const stages = Object.values(stagesMap);
  stages.sort((a, b) => a.minOrder - b.minOrder);

  // Determine stage statuses and clean up temporary properties
  const stagesList = stages.map((stage, index) => {
    const total = stage.questions.length;
    const completed = stage.questions.filter(q => q.status === 'SOLVED').length;
    const inProgress = stage.questions.filter(q => q.status === 'IN_PROGRESS').length;
    
    let status = 'upcoming';
    if (total > 0 && completed === total) {
      status = 'completed';
    } else if (completed > 0 || inProgress > 0 || (currentQuestionRow && currentQuestionRow.topic_name === stage.title)) {
      status = 'in_progress';
    }

    return {
      id: stage.id,
      title: stage.title,
      order: index + 1,
      totalQuestions: total,
      completedQuestions: completed,
      status,
      questions: stage.questions,
    };
  });

  return {
    roadmap: {
      totalQuestions,
      completedQuestions,
      inProgressQuestions,
      completionPercentage,
      currentQuestion: currentQuestionRow ? {
        id: currentQuestionRow.id,
        title: currentQuestionRow.title,
        slug: currentQuestionRow.slug,
        difficulty: currentQuestionRow.difficulty,
        topic: currentQuestionRow.topic_name,
        pattern: currentQuestionRow.pattern_name,
        leetcodeUrl: currentQuestionRow.leetcode_url || currentQuestionRow.source_url,
        status: currentQuestionRow.progress_status || 'NOT_STARTED',
      } : null,
      stages: stagesList,
    },
  };
};

module.exports = {
  getRoadmap,
};
