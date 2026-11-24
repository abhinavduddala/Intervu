const logger = require('../../utils/logger');
const { AppError, NotFoundError, ForbiddenError, ConflictError, ValidationError } = require('../../errors/AppError');
const geminiProvider = require('../ai/providers/gemini.provider');
const repo = require('./interview.repository');
const prompts = require('./interview.prompt');
const schemas = require('./interview.schema');
const profiles = require('./interview.profiles');

const MAX_PAUSE_SECONDS = 10 * 60;
const ANSWER_GRACE_SECONDS = 120; // answers that arrive just after time is up are still accepted
const ABANDON_AFTER_HOURS = 24;
const STUCK_TURN_SECONDS = 180; // a turn left in "processing" this long is treated as failed
const MIN_ANSWERS_FOR_REPORT = 1;
const MAX_NOTES = 30;
const TURN_TIMEOUT_MS = 60000;
const EVALUATION_TIMEOUT_MS = 180000;

// ---- Helpers ----

const secondsBetween = (later, earlier) => Math.floor((new Date(later) - new Date(earlier)) / 1000);

/** Seconds left on the interview clock; a paused clock stops at paused_at. */
const remainingSeconds = (interview, now = new Date()) => {
  const reference = interview.status === 'paused' && interview.paused_at ? interview.paused_at : now;
  return secondsBetween(interview.ends_at, reference);
};

const usedSeconds = (interview) => {
  const end = interview.completed_at || new Date();
  return Math.max(0, secondsBetween(end, interview.started_at) - (interview.paused_seconds || 0));
};

const getReadinessCompanies = () => require('../company/company.service').getCompaniesList();

const assertOwner = (interview, userId) => {
  if (!interview) throw new NotFoundError('Mock interview not found');
  if (interview.user_id !== userId) throw new ForbiddenError('You are not authorized to access this interview');
};

/**
 * One AI call: provider retries cover overload and timeouts; one extra attempt
 * covers a response that fails validation.
 */
const callAI = async (prompt, schema, validator, options) => {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { result, modelUsed } = await geminiProvider.generateStructuredWithRetry(
      prompt.systemPrompt,
      prompt.userPrompt,
      schema,
      options
    );
    try {
      return { result: validator(result), modelUsed };
    } catch (err) {
      lastError = err;
      logger.warn(`[MockInterview] AI output failed validation (attempt ${attempt + 1})`);
    }
  }
  throw lastError;
};

// ---- Formatting (never exposes plan, state, notes or model names) ----

const formatMessage = (m, mode) => ({
  id: m.id,
  sender: m.sender,
  message: m.message,
  intent: m.intent,
  questionNumber: m.question_number,
  section: m.section,
  inputMode: m.input_mode,
  clientMessageId: m.sender === 'candidate' ? m.client_message_id : undefined,
  feedback: mode === 'practice' && m.meta?.practiceFeedback ? m.meta.practiceFeedback : null,
  createdAt: m.created_at,
});

const formatInterview = (row) => {
  const sections = (row.plan?.sections || []).map((s) => s.section);
  return {
    id: row.id,
    companyName: row.company_name,
    interviewType: row.interview_type,
    interviewTypeLabel: profiles.INTERVIEW_TYPES[row.interview_type]?.label || row.interview_type,
    jobRole: row.job_role,
    experienceLevel: row.experience_level,
    difficulty: row.difficulty,
    mode: row.mode,
    durationMinutes: row.duration_minutes,
    questionTarget: row.question_target,
    programmingLanguage: row.programming_language,
    includeProjectQuestions: Boolean(row.state?.settings?.includeProjectQuestions),
    hasCandidateContext: Boolean(row.candidate_context),
    status: row.status,
    turnState: row.turn_state,
    questionsAsked: row.questions_asked,
    currentSection: row.state?.currentSection || sections[0] || null,
    sections,
    startedAt: row.started_at,
    endsAt: row.ends_at,
    pausedAt: row.paused_at,
    pausedSeconds: row.paused_seconds,
    pauseSecondsLeft: Math.max(0, MAX_PAUSE_SECONDS - (row.paused_seconds || 0)),
    remainingSeconds: ['in_progress', 'paused'].includes(row.status) ? Math.max(0, remainingSeconds(row)) : 0,
    completedAt: row.completed_at,
    endReason: row.end_reason,
    overallScore: row.overall_score !== null && row.overall_score !== undefined ? Number(row.overall_score) : null,
    createdAt: row.created_at,
  };
};

const formatListItem = (row) => ({
  id: row.id,
  companyName: row.company_name,
  interviewType: row.interview_type,
  interviewTypeLabel: profiles.INTERVIEW_TYPES[row.interview_type]?.label || row.interview_type,
  jobRole: row.job_role,
  experienceLevel: row.experience_level,
  difficulty: row.difficulty,
  mode: row.mode,
  durationMinutes: row.duration_minutes,
  questionTarget: row.question_target,
  status: row.status,
  questionsAsked: row.questions_asked,
  startedAt: row.started_at,
  completedAt: row.completed_at,
  endReason: row.end_reason,
  overallScore: row.overall_score !== null ? Number(row.overall_score) : null,
  evaluationStatus: row.evaluation_status || null,
  readinessLevel: row.readiness_level || null,
  createdAt: row.created_at,
});

// ---- Evaluation scheduling ----

const queueEvaluation = async (interviewId) => {
  const { redis } = require('../../config/redis');
  if (redis.status === 'ready') {
    const { mockInterviewQueue } = require('../../queues/queues');
    await mockInterviewQueue.add(`mock-interview-evaluation-${interviewId}`, { interviewId });
    return;
  }
  // Without Redis the queue cannot run; evaluate in-process so the user still gets a report
  logger.warn(`[MockInterview] Redis unavailable; evaluating interview ${interviewId} in-process`);
  setImmediate(() => {
    runEvaluation(interviewId).catch(async (err) => {
      logger.error(`[MockInterview] In-process evaluation failed for ${interviewId}: ${err.message}`);
      await markEvaluationFailed(interviewId, err).catch(() => {});
    });
  });
};

/**
 * Closes an interview inside an open transaction. Returns true when an
 * evaluation must be queued after commit.
 */
const closeInterview = async (client, interview, endReason, answerCount) => {
  const now = new Date();
  let pausedSeconds = interview.paused_seconds || 0;
  if (interview.status === 'paused' && interview.paused_at) {
    pausedSeconds += Math.min(secondsBetween(now, interview.paused_at), MAX_PAUSE_SECONDS);
  }

  const evaluate = answerCount >= MIN_ANSWERS_FOR_REPORT;
  await repo.updateInterview(client, interview.id, {
    status: evaluate ? 'evaluating' : 'abandoned',
    turnState: 'awaiting_answer',
    pausedAt: null,
    pausedSeconds,
    completedAt: now,
    endReason: evaluate ? endReason : endReason === 'time_up' ? 'time_up' : 'abandoned',
  });
  if (evaluate) await repo.upsertPendingEvaluation(client, interview.id);
  return evaluate;
};

const countAnswers = (messages) => messages.filter((m) => m.sender === 'candidate').length;

/**
 * Applies time-based transitions on read: closes interviews past their time
 * and abandons ones left idle for a day.
 */
const refreshExpiry = async (interview) => {
  if (!['in_progress', 'paused'].includes(interview.status)) return interview;

  const idleHours = (Date.now() - new Date(interview.last_activity_at)) / 3600000;
  const timedOut = interview.status === 'in_progress' && remainingSeconds(interview) < -ANSWER_GRACE_SECONDS;
  const pauseExpired =
    interview.status === 'paused' &&
    secondsBetween(new Date(), interview.paused_at) + (interview.paused_seconds || 0) > MAX_PAUSE_SECONDS + 3600;

  if (!timedOut && !pauseExpired && idleHours < ABANDON_AFTER_HOURS) return interview;
  if (interview.turn_state === 'processing' && !timedOut) return interview;

  const reason = timedOut ? 'time_up' : 'abandoned';
  let evaluate = false;
  await repo.withTransaction(async (client) => {
    const locked = await repo.lockById(client, interview.id);
    if (!locked || !['in_progress', 'paused'].includes(locked.status)) return;
    const messages = await repo.findMessages(locked.id, client);
    evaluate = await closeInterview(client, locked, reason, countAnswers(messages));
  });
  if (evaluate) await queueEvaluation(interview.id);
  logger.info(`[MockInterview] Interview ${interview.id} closed on read (${reason})`);
  return repo.findById(interview.id);
};

// ---- Public operations ----

const getOptions = () => profiles.getOptions(getReadinessCompanies());

const createInterview = async (userId, input) => {
  const type = profiles.INTERVIEW_TYPES[input.interviewType];
  const companyName = input.companyName ? profiles.findCompany(input.companyName) : null;
  if (input.companyName && !companyName) {
    throw new ValidationError('Validation failed', [{ field: 'companyName', message: 'Unsupported company' }]);
  }
  if (type.requiresLanguage && !input.programmingLanguage) {
    throw new ValidationError('Validation failed', [
      { field: 'programmingLanguage', message: 'Choose a programming language for this interview type' },
    ]);
  }

  // Close anything stale first so it does not block a new interview
  const stale = await repo.findStaleActive(userId, ABANDON_AFTER_HOURS);
  for (const row of stale) await refreshExpiry(row);

  const active = await repo.findActiveByUser(userId);
  if (active) {
    const refreshed = await refreshExpiry(active);
    if (['in_progress', 'paused'].includes(refreshed.status)) {
      throw new AppError('You already have an interview in progress. Resume or end it first.', 409, 'INTERVIEW_ACTIVE', {
        activeInterviewId: refreshed.id,
      });
    }
  }

  const config = {
    user_id: userId,
    company_name: companyName,
    interview_type: input.interviewType,
    job_role: input.jobRole,
    experience_level: input.experienceLevel,
    difficulty: input.difficulty,
    mode: input.mode,
    duration_minutes: input.durationMinutes,
    question_target: input.questionCount || profiles.DEFAULT_QUESTIONS[input.durationMinutes],
    programming_language: input.programmingLanguage || null,
    candidate_context: input.candidateContext ? input.candidateContext.trim() : null,
    state: { settings: { includeProjectQuestions: Boolean(input.includeProjectQuestions) } },
  };

  // Generate the opening before writing anything, so a failed AI call leaves no half-made interview
  const { result: opening } = await callAI(prompts.buildOpeningPrompt(config), schemas.openingSchema, schemas.validateOpening, {
    timeoutMs: TURN_TIMEOUT_MS,
    temperature: 0.7,
  });

  try {
    const interview = await repo.withTransaction(async (client) => {
      const created = await repo.createInterview(client, {
        userId,
        companyName: config.company_name,
        interviewType: config.interview_type,
        jobRole: config.job_role,
        experienceLevel: config.experience_level,
        difficulty: config.difficulty,
        mode: config.mode,
        durationMinutes: config.duration_minutes,
        questionTarget: config.question_target,
        programmingLanguage: config.programming_language,
        candidateContext: config.candidate_context,
      });
      await repo.addMessage(client, {
        interviewId: created.id,
        sender: 'interviewer',
        message: opening.message,
        intent: 'question',
        // A warm-up (e.g. self-introduction) is not one of the main questions
        questionNumber: opening.isWarmUp ? null : 1,
        section: opening.section,
        topic: opening.topic,
        difficulty: opening.difficulty,
      });
      return repo.updateInterview(client, created.id, {
        plan: { sections: opening.plan },
        state: {
          ...config.state,
          coveredTopics: opening.topic ? [opening.topic] : [],
          currentDifficulty: opening.difficulty,
          currentSection: opening.section,
          followUps: 0,
          notes: [],
        },
        questionsAsked: opening.isWarmUp ? 0 : 1,
      });
    });

    logger.info(`[MockInterview] Interview ${interview.id} started for user=${userId} type=${interview.interview_type}`);
    return getInterview(userId, interview.id);
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('You already have an interview in progress. Resume or end it first.', 409, 'INTERVIEW_ACTIVE');
    }
    throw err;
  }
};

const getInterview = async (userId, id) => {
  let interview = await repo.findById(id);
  assertOwner(interview, userId);
  interview = await refreshExpiry(interview);
  const messages = await repo.findMessages(id);
  return {
    interview: formatInterview(interview),
    messages: messages.map((m) => formatMessage(m, interview.mode)),
  };
};

const getActiveInterview = async (userId) => {
  const active = await repo.findActiveByUser(userId);
  if (!active) return { interview: null };
  const refreshed = await refreshExpiry(active);
  return { interview: ['in_progress', 'paused'].includes(refreshed.status) ? formatInterview(refreshed) : null };
};

const listInterviews = async (userId, { page, limit }) => {
  const { rows, total } = await repo.listByUser(userId, { limit, offset: (page - 1) * limit });
  return {
    interviews: rows.map(formatListItem),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
};

const getStatus = async (userId, id) => {
  let interview = await repo.findById(id);
  assertOwner(interview, userId);
  interview = await refreshExpiry(interview);
  const evaluation = await repo.findEvaluation(id);
  return {
    interview: formatInterview(interview),
    evaluation: evaluation
      ? { status: evaluation.status, errorMessage: evaluation.error_message, completedAt: evaluation.completed_at }
      : null,
  };
};

/**
 * Saves the candidate's answer and returns the interviewer's next message.
 * Idempotent per clientMessageId: a retried request returns the saved reply
 * or regenerates it after a failed attempt, without saving the answer twice.
 */
const submitAnswer = async (userId, id, { answer, clientMessageId, inputMode }) => {
  const initial = await repo.findById(id);
  assertOwner(initial, userId);
  await refreshExpiry(initial);

  // Step 1 (short transaction): claim the turn and store the answer
  const claim = await repo.withTransaction(async (client) => {
    const interview = await repo.lockById(client, id);
    if (interview.status === 'paused') throw new ConflictError('The interview is paused. Resume it to continue.');
    if (interview.status !== 'in_progress') throw new ConflictError('This interview has already ended.');

    const existing = await repo.findMessageByClientId(client, id, clientMessageId);
    if (existing) {
      const reply = await repo.findReplyAfter(client, id, existing.id);
      if (reply) return { interview, candidate: existing, reply };
    }

    const stuck =
      interview.turn_state === 'processing' && secondsBetween(new Date(), interview.updated_at) > STUCK_TURN_SECONDS;
    if (interview.turn_state === 'processing' && !stuck) {
      throw new AppError('Your previous answer is still being processed.', 409, 'TURN_IN_PROGRESS');
    }

    if (!existing) {
      // An unanswered retry of an older failed turn must not be replaced by a new answer
      if (interview.turn_state === 'reply_failed' || stuck) {
        const messages = await repo.findMessages(id, client);
        const last = messages[messages.length - 1];
        if (last && last.sender === 'candidate') {
          throw new AppError('Retry your previous answer first.', 409, 'REPLY_PENDING', { clientMessageId: last.client_message_id });
        }
      }
    }

    const candidate =
      existing ||
      (await repo.addMessage(client, {
        interviewId: id,
        sender: 'candidate',
        message: answer,
        questionNumber: interview.questions_asked || null,
        section: interview.state?.currentSection,
        inputMode: inputMode || 'text',
        clientMessageId,
      }));
    const updated = await repo.updateInterview(client, id, { turnState: 'processing' });
    return { interview: updated, candidate, reply: null };
  });

  if (claim.reply) {
    return { ...(await getTurnResult(userId, id)), reply: formatMessage(claim.reply, claim.interview.mode) };
  }

  // Step 2 (no transaction held): ask the AI for the next message
  const interview = claim.interview;
  const messages = await repo.findMessages(id);
  const remaining = remainingSeconds(interview);
  const state = interview.state || {};
  const answers = countAnswers(messages);
  // Close on time, or once the last main question has had its follow-ups (max two)
  const forceClose =
    remaining <= 0
      ? 'time'
      : interview.questions_asked > interview.question_target ||
          (interview.questions_asked >= interview.question_target && (state.followUps || 0) >= 2) ||
          answers >= interview.question_target * 4 + 1
        ? 'questions'
        : false;

  let turn;
  try {
    ({ result: turn } = await callAI(
      prompts.buildTurnPrompt(interview, messages, { remainingSeconds: remaining, forceClose }),
      schemas.turnSchema,
      schemas.validateTurn,
      { timeoutMs: TURN_TIMEOUT_MS, temperature: 0.7, retries: 2 }
    ));
  } catch (err) {
    await repo.updateInterview(require('../../config/db'), id, { turnState: 'reply_failed' });
    throw err;
  }

  // Step 3: store the reply and update the running interview state
  const isClosing = forceClose || turn.shouldEnd || turn.intent === 'closing';
  const newQuestion = !isClosing && turn.isNewQuestion;
  const questionNumber = newQuestion ? interview.questions_asked + 1 : interview.questions_asked || null;

  const notes = [...(state.notes || [])];
  if (turn.notes) notes.push({ q: interview.questions_asked, quality: turn.answerQuality, note: turn.notes });
  const coveredTopics = [...new Set([...(state.coveredTopics || []), ...(turn.topic ? [turn.topic] : [])])].slice(-40);

  let evaluate = false;
  const reply = await repo.withTransaction(async (client) => {
    const locked = await repo.lockById(client, id);
    const saved = await repo.addMessage(client, {
      interviewId: id,
      sender: 'interviewer',
      message: turn.message,
      intent: isClosing ? 'closing' : turn.intent,
      questionNumber,
      section: isClosing ? 'Wrap-up' : turn.section || state.currentSection,
      topic: turn.topic,
      difficulty: turn.difficulty,
      meta: {
        answerQuality: turn.answerQuality,
        practiceFeedback: interview.mode === 'practice' ? turn.practiceFeedback : '',
      },
    });

    // Private per-answer notes also go on the candidate message for the report
    await client.query(`UPDATE mock_interview_messages SET meta = meta || $2::jsonb WHERE id = $1`, [
      claim.candidate.id,
      JSON.stringify({ answerQuality: turn.answerQuality, note: turn.notes }),
    ]);

    await repo.updateInterview(client, id, {
      turnState: 'awaiting_answer',
      questionsAsked: questionNumber || 0,
      state: {
        ...state,
        notes: notes.slice(-MAX_NOTES),
        coveredTopics,
        currentDifficulty: turn.difficulty,
        currentSection: isClosing ? 'Wrap-up' : turn.section || state.currentSection,
        followUps: newQuestion ? 0 : (state.followUps || 0) + 1,
      },
    });

    if (isClosing && ['in_progress', 'paused'].includes(locked.status)) {
      const fresh = await repo.lockById(client, id);
      evaluate = await closeInterview(client, fresh, remaining <= 0 ? 'time_up' : 'ai_closed', answers);
    }
    return saved;
  });

  if (evaluate) await queueEvaluation(id);
  return { ...(await getTurnResult(userId, id)), reply: formatMessage(reply, interview.mode) };
};

const getTurnResult = async (userId, id) => {
  const interview = await repo.findById(id);
  return { interview: formatInterview(interview) };
};

const pauseInterview = async (userId, id) => {
  const interview = await repo.findById(id);
  assertOwner(interview, userId);
  return repo.withTransaction(async (client) => {
    const locked = await repo.lockById(client, id);
    if (locked.status !== 'in_progress') throw new ConflictError('Only a running interview can be paused.');
    if (locked.turn_state === 'processing') throw new ConflictError('Wait for the interviewer to respond before pausing.');
    if ((locked.paused_seconds || 0) >= MAX_PAUSE_SECONDS) {
      throw new ConflictError('You have used all of the pause time for this interview.');
    }
    const updated = await repo.updateInterview(client, id, { status: 'paused', pausedAt: new Date() });
    return { interview: formatInterview(updated) };
  });
};

const resumeInterview = async (userId, id) => {
  const interview = await repo.findById(id);
  assertOwner(interview, userId);
  return repo.withTransaction(async (client) => {
    const locked = await repo.lockById(client, id);
    if (locked.status !== 'paused') throw new ConflictError('This interview is not paused.');
    const now = new Date();
    const pausedFor = Math.max(0, secondsBetween(now, locked.paused_at));
    // Only pause time within the allowance extends the clock
    const credited = Math.min(pausedFor, Math.max(0, MAX_PAUSE_SECONDS - (locked.paused_seconds || 0)));
    const updated = await repo.updateInterview(client, id, {
      status: 'in_progress',
      pausedAt: null,
      pausedSeconds: (locked.paused_seconds || 0) + credited,
      endsAt: new Date(new Date(locked.ends_at).getTime() + credited * 1000),
    });
    return { interview: formatInterview(updated) };
  });
};

const endInterview = async (userId, id, { reason } = {}) => {
  const interview = await repo.findById(id);
  assertOwner(interview, userId);
  let evaluate = false;
  await repo.withTransaction(async (client) => {
    const locked = await repo.lockById(client, id);
    if (!['in_progress', 'paused'].includes(locked.status)) return;
    const messages = await repo.findMessages(id, client);
    const endReason = reason === 'time_up' && remainingSeconds(locked) <= 5 ? 'time_up' : 'user_ended';
    evaluate = await closeInterview(client, locked, endReason, countAnswers(messages));
  });
  if (evaluate) await queueEvaluation(id);
  return getStatus(userId, id);
};

const retryEvaluation = async (userId, id) => {
  const interview = await repo.findById(id);
  assertOwner(interview, userId);
  const evaluation = await repo.findEvaluation(id);
  if (!evaluation || evaluation.status !== 'failed') {
    throw new ConflictError('Only a failed report can be retried.');
  }
  await repo.withTransaction(async (client) => {
    await repo.upsertPendingEvaluation(client, id);
    await repo.updateInterview(client, id, { status: 'evaluating' });
  });
  await queueEvaluation(id);
  return getStatus(userId, id);
};

const deleteInterview = async (userId, id) => {
  const interview = await repo.findById(id);
  assertOwner(interview, userId);
  if (interview.turn_state === 'processing' || interview.status === 'evaluating') {
    throw new ConflictError('This interview is being processed. Try again in a moment.');
  }
  await repo.deleteById(id, userId);
  return { deleted: true };
};

// ---- Evaluation (run by the worker) ----

const runEvaluation = async (interviewId) => {
  const interview = await repo.findById(interviewId);
  if (!interview) return null;
  const evaluation = await repo.findEvaluation(interviewId);
  if (evaluation?.status === 'completed') return evaluation;

  await repo.setEvaluationStatus(interviewId, 'processing');
  const messages = await repo.findMessages(interviewId);

  const { result, modelUsed } = await callAI(
    prompts.buildEvaluationPrompt(interview, messages, { usedSeconds: usedSeconds(interview) }),
    schemas.evaluationSchema,
    schemas.validateEvaluation,
    { timeoutMs: EVALUATION_TIMEOUT_MS, temperature: 0.2, retries: 1 }
  );

  await repo.completeEvaluation(interviewId, result, modelUsed);
  logger.info(`[MockInterview] Evaluation completed for interview ${interviewId} (score ${result.overallScore})`);
  return result;
};

const publicError = (err) =>
  err instanceof AppError && err.isOperational ? err.message : 'The AI report could not be generated. Please try again.';

const markEvaluationFailed = async (interviewId, err) => {
  await repo.setEvaluationStatus(interviewId, 'failed', publicError(err));
  await repo.updateInterview(require('../../config/db'), interviewId, { status: 'failed' });
};

const markEvaluationRetrying = async (interviewId, err) => {
  await repo.setEvaluationStatus(interviewId, 'pending', publicError(err));
};

// ---- Report ----

/** Maps free-text revision topics from the report to topic/pattern names in the question bank. */
const matchBankTopics = (revisionTopics, bankNames) => {
  const matched = new Set();
  revisionTopics.forEach((topic) => {
    const t = topic.toLowerCase();
    bankNames.forEach((name) => {
      const n = name.toLowerCase();
      if (n === t || (n.length > 3 && t.includes(n)) || (t.length > 3 && n.includes(t))) matched.add(name);
    });
  });
  return [...matched];
};

const getReport = async (userId, id) => {
  const interview = await repo.findById(id);
  assertOwner(interview, userId);
  const evaluation = await repo.findEvaluation(id);
  if (!evaluation) throw new NotFoundError('No report exists for this interview');
  if (evaluation.status !== 'completed') {
    return { status: evaluation.status, errorMessage: evaluation.error_message, report: null };
  }

  const report = evaluation.report || {};
  const messages = await repo.findMessages(id);

  const bankNames = await repo.findAllTopicAndPatternNames();
  const topics = matchBankTopics(report.revisionTopics || [], bankNames);
  const recommendedQuestions = (await repo.findRecommendedQuestions(userId, topics, interview.company_name)).map((q) => ({
    id: q.id,
    title: q.title,
    slug: q.slug,
    difficulty: q.difficulty,
    topic: q.topic_name,
    pattern: q.pattern_name,
    companyMatch: q.company_match,
  }));

  let company = null;
  if (interview.company_name) {
    const stats = await repo.getStats(userId);
    const mock = stats.companies.find((c) => c.company_name === interview.company_name);
    let readiness = null;
    if (getReadinessCompanies().includes(interview.company_name)) {
      const companyRepository = require('../company/company.repository');
      const row = await companyRepository.findReadiness(userId, interview.company_name);
      readiness = row ? Number(parseFloat(row.readiness_score).toFixed(1)) : null;
    }
    company = {
      name: interview.company_name,
      mockInterviewScore: mock ? mock.mock_score : null,
      mockInterviews: mock ? mock.interviews : 0,
      practiceReadiness: readiness,
      hasReadiness: getReadinessCompanies().includes(interview.company_name),
    };
  }

  return {
    status: 'completed',
    interview: formatInterview(interview),
    report: {
      overallScore: evaluation.overall_score,
      readinessLevel: evaluation.readiness_level,
      readinessAssessment: report.readinessAssessment,
      summary: report.summary,
      categories: report.categories,
      answerReviews: report.answerReviews,
      strongestAnswers: report.strongestAnswers,
      weakestAnswers: report.weakestAnswers,
      missedConcepts: report.missedConcepts,
      communicationFeedback: report.communicationFeedback,
      revisionTopics: report.revisionTopics,
      roadmap: report.roadmap,
      completedAt: evaluation.completed_at,
    },
    transcript: messages.map((m) => formatMessage(m, interview.mode)),
    recommendedQuestions,
    company,
  };
};

const getStats = async (userId) => {
  const stats = await repo.getStats(userId);
  const readinessCompanies = getReadinessCompanies();
  return {
    totals: {
      total: stats.totals.total,
      completed: stats.totals.completed,
      averageScore: stats.totals.average_score,
      bestScore: stats.totals.best_score,
    },
    trend: stats.trend.map((t) => ({
      id: t.id,
      score: t.score,
      interviewType: t.interview_type,
      companyName: t.company_name,
      completedAt: t.completed_at,
    })),
    categories: stats.totals.completed > 0 ? stats.categories : null,
    companies: stats.companies.map((c) => ({
      companyName: c.company_name,
      mockInterviewScore: c.mock_score,
      interviews: c.interviews,
      lastInterviewAt: c.last_interview_at,
      hasReadiness: readinessCompanies.includes(c.company_name),
    })),
  };
};

module.exports = {
  getOptions,
  createInterview,
  getInterview,
  getActiveInterview,
  listInterviews,
  getStatus,
  submitAnswer,
  pauseInterview,
  resumeInterview,
  endInterview,
  retryEvaluation,
  deleteInterview,
  getReport,
  getStats,
  runEvaluation,
  markEvaluationFailed,
  markEvaluationRetrying,
  // exported for tests
  _internal: { remainingSeconds, matchBankTopics },
};
