/**
 * Structured-output schemas for the AI interviewer and evaluator, plus
 * validators that check and normalise every AI response before it is saved.
 */
const { AppError } = require('../../errors/AppError');

const INTENTS = ['question', 'follow_up', 'clarification', 'challenge', 'transition', 'closing'];
const ANSWER_QUALITY = ['strong', 'partial', 'weak', 'off_topic', 'none'];
const READINESS_LEVELS = ['not_ready', 'needs_practice', 'almost_ready', 'ready', 'strong'];
const CATEGORY_KEYS = [
  'technical_knowledge',
  'problem_solving',
  'communication',
  'logical_thinking',
  'accuracy',
  'confidence',
  'optimization',
  'time_management',
];
const ANSWER_VERDICTS = ['correct', 'partially_correct', 'incorrect', 'incomplete', 'not_answered'];

const openingSchema = {
  type: 'object',
  properties: {
    plan: {
      type: 'array',
      description: 'Private interview plan: ordered sections, each with 1-4 topics to cover. Never shown to the candidate.',
      items: {
        type: 'object',
        properties: {
          section: { type: 'string' },
          topics: { type: 'array', items: { type: 'string' } },
        },
        required: ['section', 'topics'],
      },
    },
    message: {
      type: 'string',
      description: 'Spoken to the candidate: a short welcome, one or two sentences on the format, then exactly one first question.',
    },
    section: { type: 'string', description: 'Plan section the first question belongs to.' },
    topic: { type: 'string', description: 'Topic of the first question.' },
    difficulty: { type: 'integer', description: 'Difficulty of the first question, 1 (easiest) to 5 (hardest).' },
    isWarmUp: {
      type: 'boolean',
      description: 'True when the first question is a warm-up (for example a self-introduction) and not one of the main questions.',
    },
  },
  required: ['plan', 'message', 'section', 'topic', 'difficulty', 'isWarmUp'],
};

const turnSchema = {
  type: 'object',
  properties: {
    answerQuality: {
      type: 'string',
      enum: ANSWER_QUALITY,
      description: "Private assessment of the candidate's latest answer.",
    },
    notes: {
      type: 'string',
      description: 'Private one or two sentence observation about the latest answer, citing what the candidate actually said. Used for the final report.',
    },
    practiceFeedback: {
      type: 'string',
      description: 'Only in practice mode: two or three sentences of feedback on the latest answer. Empty string in realistic mode.',
    },
    intent: { type: 'string', enum: INTENTS, description: 'What the interviewer message does.' },
    isNewQuestion: {
      type: 'boolean',
      description: 'True when the message asks a new main question (not a follow-up or clarification of the current one).',
    },
    message: {
      type: 'string',
      description: 'What the interviewer says next. Ask at most one question. Never reveal the answer to an open question.',
    },
    section: { type: 'string' },
    topic: { type: 'string' },
    difficulty: { type: 'integer', description: 'Difficulty of the question being asked, 1 to 5.' },
    shouldEnd: {
      type: 'boolean',
      description: 'True only when this message is the closing remark of the interview.',
    },
  },
  required: ['answerQuality', 'notes', 'practiceFeedback', 'intent', 'isNewQuestion', 'message', 'section', 'topic', 'difficulty', 'shouldEnd'],
};

const evaluationSchema = {
  type: 'object',
  properties: {
    overallScore: { type: 'integer', description: 'Overall score 0-100, consistent with the category scores.' },
    readinessLevel: { type: 'string', enum: READINESS_LEVELS },
    readinessAssessment: { type: 'string', description: 'Two or three sentences on interview readiness for the selected role and company.' },
    summary: { type: 'string', description: 'Performance summary in three to five sentences.' },
    categories: {
      type: 'array',
      description: 'Exactly one entry per category key.',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', enum: CATEGORY_KEYS },
          applicable: { type: 'boolean', description: 'False when the interview gave no evidence for this category.' },
          score: { type: 'integer', description: '0-100. Use 0 when not applicable.' },
          explanation: { type: 'string', description: 'One or two sentences justifying the score with evidence from the transcript.' },
          strengths: { type: 'array', items: { type: 'string' } },
          improvements: { type: 'array', items: { type: 'string' } },
        },
        required: ['key', 'applicable', 'score', 'explanation', 'strengths', 'improvements'],
      },
    },
    answerReviews: {
      type: 'array',
      description: 'Exactly one entry per main question, with its follow-ups folded into the same entry. Use questionNumber 0 for a warm-up or introduction.',
      items: {
        type: 'object',
        properties: {
          questionNumber: { type: 'integer' },
          question: { type: 'string', description: 'Short restatement of the question.' },
          verdict: { type: 'string', enum: ANSWER_VERDICTS },
          score: { type: 'integer', description: '0-100 for this answer.' },
          evidence: { type: 'string', description: "What the candidate actually said that supports the verdict." },
          suggestedAnswer: { type: 'string', description: 'A concise model answer or explanation of the key points.' },
        },
        required: ['questionNumber', 'question', 'verdict', 'score', 'evidence', 'suggestedAnswer'],
      },
    },
    strongestAnswers: { type: 'array', items: { type: 'integer' }, description: 'Question numbers of the strongest answers (up to 3).' },
    weakestAnswers: { type: 'array', items: { type: 'integer' }, description: 'Question numbers of the weakest answers (up to 3).' },
    missedConcepts: { type: 'array', items: { type: 'string' } },
    communicationFeedback: { type: 'string' },
    revisionTopics: {
      type: 'array',
      items: { type: 'string' },
      description: 'Up to 6 short topic names to revise, for example "Graphs", "Dynamic Programming", "Indexing".',
    },
    roadmap: {
      type: 'array',
      description: 'Personalised improvement roadmap: 3 to 5 ordered steps.',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          timeframe: { type: 'string', description: 'For example "Week 1".' },
          actions: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'timeframe', 'actions'],
      },
    },
  },
  required: [
    'overallScore',
    'readinessLevel',
    'readinessAssessment',
    'summary',
    'categories',
    'answerReviews',
    'strongestAnswers',
    'weakestAnswers',
    'missedConcepts',
    'communicationFeedback',
    'revisionTopics',
    'roadmap',
  ],
};

// ---- Validation helpers ----

const invalid = () => new AppError('The AI returned an invalid response. Please try again.', 502, 'BAD_GATEWAY');

const str = (value, max, { required = false } = {}) => {
  if (typeof value !== 'string' || (required && !value.trim())) {
    if (required) throw invalid();
    return '';
  }
  return value.trim().slice(0, max);
};

const int = (value, min, max, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
};

const strList = (value, maxItems, maxLen) =>
  Array.isArray(value)
    ? value.filter((v) => typeof v === 'string' && v.trim()).slice(0, maxItems).map((v) => v.trim().slice(0, maxLen))
    : [];

const oneOf = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

// Fold duplicate reviews of the same question (e.g. a separate follow-up entry) into one
const mergeReviews = (list, review) => {
  const existing = list.find((r) => r.questionNumber === review.questionNumber);
  if (!existing) return [...list, { ...review, parts: 1 }];
  existing.score = Math.round((existing.score * existing.parts + review.score) / (existing.parts + 1));
  existing.parts += 1;
  existing.evidence = `${existing.evidence} ${review.evidence}`.trim().slice(0, 1600);
  existing.suggestedAnswer = `${existing.suggestedAnswer}\n\n${review.suggestedAnswer}`.trim().slice(0, 4000);
  return list;
};

const validateOpening = (raw) => {
  if (!raw || typeof raw !== 'object') throw invalid();
  const plan = Array.isArray(raw.plan)
    ? raw.plan
        .filter((s) => s && typeof s.section === 'string')
        .slice(0, 8)
        .map((s) => ({ section: s.section.trim().slice(0, 80), topics: strList(s.topics, 5, 120) }))
    : [];
  return {
    plan,
    message: str(raw.message, 4000, { required: true }),
    section: str(raw.section, 80) || plan[0]?.section || 'Introduction',
    topic: str(raw.topic, 120),
    difficulty: int(raw.difficulty, 1, 5, 2),
    isWarmUp: raw.isWarmUp === true,
  };
};

const validateTurn = (raw) => {
  if (!raw || typeof raw !== 'object') throw invalid();
  return {
    answerQuality: oneOf(raw.answerQuality, ANSWER_QUALITY, 'none'),
    notes: str(raw.notes, 600),
    practiceFeedback: str(raw.practiceFeedback, 1500),
    intent: oneOf(raw.intent, INTENTS, 'follow_up'),
    isNewQuestion: raw.isNewQuestion === true,
    message: str(raw.message, 4000, { required: true }),
    section: str(raw.section, 80),
    topic: str(raw.topic, 120),
    difficulty: int(raw.difficulty, 1, 5, 3),
    shouldEnd: raw.shouldEnd === true,
  };
};

const validateEvaluation = (raw) => {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.categories)) throw invalid();

  const byKey = {};
  raw.categories.forEach((c) => {
    if (c && CATEGORY_KEYS.includes(c.key) && !byKey[c.key]) {
      const applicable = c.applicable !== false;
      byKey[c.key] = {
        key: c.key,
        applicable,
        score: applicable ? int(c.score, 0, 100, 0) : null,
        explanation: str(c.explanation, 800),
        strengths: strList(c.strengths, 5, 300),
        improvements: strList(c.improvements, 5, 300),
      };
    }
  });
  const categories = CATEGORY_KEYS.map(
    (key) => byKey[key] || { key, applicable: false, score: null, explanation: '', strengths: [], improvements: [] }
  );

  const scored = categories.filter((c) => c.applicable);
  if (scored.length === 0) throw invalid();
  const categoryAverage = Math.round(scored.reduce((sum, c) => sum + c.score, 0) / scored.length);
  // Keep the overall score consistent with the evidence-based category scores
  let overallScore = int(raw.overallScore, 0, 100, categoryAverage);
  if (Math.abs(overallScore - categoryAverage) > 15) overallScore = categoryAverage;

  const answerReviews = Array.isArray(raw.answerReviews)
    ? raw.answerReviews
        .filter((a) => a && typeof a.question === 'string')
        .slice(0, 30)
        .map((a) => ({
          questionNumber: int(a.questionNumber, 0, 99, 0),
          question: str(a.question, 500),
          verdict: oneOf(a.verdict, ANSWER_VERDICTS, 'incomplete'),
          score: int(a.score, 0, 100, 0),
          evidence: str(a.evidence, 800),
          suggestedAnswer: str(a.suggestedAnswer, 2500),
        }))
        .reduce(mergeReviews, [])
        .map(({ parts, ...r }) => r)
    : [];

  const numbers = (list) =>
    Array.isArray(list) ? [...new Set(list.map((n) => int(n, 0, 99, 0)).filter((n) => n > 0))].slice(0, 3) : [];

  return {
    overallScore,
    readinessLevel: oneOf(raw.readinessLevel, READINESS_LEVELS, 'needs_practice'),
    readinessAssessment: str(raw.readinessAssessment, 1200),
    summary: str(raw.summary, 2000, { required: true }),
    categories,
    answerReviews,
    strongestAnswers: numbers(raw.strongestAnswers),
    weakestAnswers: numbers(raw.weakestAnswers),
    missedConcepts: strList(raw.missedConcepts, 10, 200),
    communicationFeedback: str(raw.communicationFeedback, 1500),
    revisionTopics: strList(raw.revisionTopics, 6, 80),
    roadmap: Array.isArray(raw.roadmap)
      ? raw.roadmap
          .filter((r) => r && typeof r.title === 'string')
          .slice(0, 6)
          .map((r) => ({ title: str(r.title, 160), timeframe: str(r.timeframe, 40), actions: strList(r.actions, 6, 300) }))
      : [],
  };
};

module.exports = {
  INTENTS,
  ANSWER_QUALITY,
  READINESS_LEVELS,
  CATEGORY_KEYS,
  ANSWER_VERDICTS,
  openingSchema,
  turnSchema,
  evaluationSchema,
  validateOpening,
  validateTurn,
  validateEvaluation,
};
