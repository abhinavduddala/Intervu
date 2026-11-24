-- Migration: AI mock interviews (sessions, transcript, evaluation reports)

CREATE TABLE IF NOT EXISTS mock_interviews (
  id                    SERIAL PRIMARY KEY,
  user_id               INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  company_name          VARCHAR(100),
  interview_type        VARCHAR(40) NOT NULL,
  job_role              VARCHAR(60) NOT NULL,
  experience_level      VARCHAR(20) NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  difficulty            VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'adaptive')),
  mode                  VARCHAR(20) NOT NULL DEFAULT 'realistic' CHECK (mode IN ('realistic', 'practice')),
  duration_minutes      INTEGER NOT NULL CHECK (duration_minutes IN (15, 30, 45, 60)),
  question_target       INTEGER NOT NULL CHECK (question_target BETWEEN 3 AND 20),
  programming_language  VARCHAR(30),
  candidate_context     TEXT,
  plan                  JSONB NOT NULL DEFAULT '{}',
  state                 JSONB NOT NULL DEFAULT '{}',
  status                VARCHAR(20) NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress', 'paused', 'evaluating', 'completed', 'failed', 'abandoned')),
  turn_state            VARCHAR(20) NOT NULL DEFAULT 'awaiting_answer'
                        CHECK (turn_state IN ('awaiting_answer', 'processing', 'reply_failed')),
  questions_asked       INTEGER NOT NULL DEFAULT 0,
  started_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paused_at             TIMESTAMPTZ,
  paused_seconds        INTEGER NOT NULL DEFAULT 0,
  ends_at               TIMESTAMPTZ NOT NULL,
  last_activity_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at          TIMESTAMPTZ,
  end_reason            VARCHAR(20) CHECK (end_reason IN ('ai_closed', 'user_ended', 'time_up', 'abandoned')),
  overall_score         NUMERIC(5, 2) CHECK (overall_score >= 0 AND overall_score <= 100),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_interviews_user_created ON mock_interviews (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_user_company ON mock_interviews (user_id, company_name);
-- At most one running interview per user
CREATE UNIQUE INDEX IF NOT EXISTS uq_mock_interviews_one_active
  ON mock_interviews (user_id) WHERE status IN ('in_progress', 'paused');

CREATE TABLE IF NOT EXISTS mock_interview_messages (
  id                 SERIAL PRIMARY KEY,
  interview_id       INTEGER NOT NULL REFERENCES mock_interviews (id) ON DELETE CASCADE,
  sender             VARCHAR(20) NOT NULL CHECK (sender IN ('interviewer', 'candidate')),
  message            TEXT NOT NULL,
  intent             VARCHAR(20),
  question_number    INTEGER,
  section            VARCHAR(80),
  topic              VARCHAR(120),
  difficulty         SMALLINT CHECK (difficulty BETWEEN 1 AND 5),
  input_mode         VARCHAR(10) CHECK (input_mode IN ('text', 'voice')),
  meta               JSONB NOT NULL DEFAULT '{}', -- private interviewer notes, never returned to clients
  client_message_id  UUID,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_interview_messages_interview ON mock_interview_messages (interview_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_mock_interview_messages_client_id
  ON mock_interview_messages (interview_id, client_message_id) WHERE client_message_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS mock_interview_evaluations (
  id                   SERIAL PRIMARY KEY,
  interview_id         INTEGER NOT NULL UNIQUE REFERENCES mock_interviews (id) ON DELETE CASCADE,
  status               VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message        TEXT,
  overall_score        SMALLINT CHECK (overall_score BETWEEN 0 AND 100),
  technical_knowledge  SMALLINT CHECK (technical_knowledge BETWEEN 0 AND 100),
  problem_solving      SMALLINT CHECK (problem_solving BETWEEN 0 AND 100),
  communication        SMALLINT CHECK (communication BETWEEN 0 AND 100),
  logical_thinking     SMALLINT CHECK (logical_thinking BETWEEN 0 AND 100),
  accuracy             SMALLINT CHECK (accuracy BETWEEN 0 AND 100),
  confidence           SMALLINT CHECK (confidence BETWEEN 0 AND 100),
  optimization         SMALLINT CHECK (optimization BETWEEN 0 AND 100),
  time_management      SMALLINT CHECK (time_management BETWEEN 0 AND 100),
  readiness_level      VARCHAR(30),
  report               JSONB,
  model_name           VARCHAR(100),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_mock_interview_evaluations_status ON mock_interview_evaluations (status);
