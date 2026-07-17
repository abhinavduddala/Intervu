-- Migration: Add LeetCode source columns and metadata to questions, and create user_question_progress table

-- 1. Modify questions table
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'leetcode',
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS article_url TEXT,
  ADD COLUMN IF NOT EXISTS company_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS estimated_time INTEGER; -- Estimated time in minutes

-- 2. Create user_question_progress table
CREATE TABLE IF NOT EXISTS user_question_progress (
  id                      SERIAL,
  user_id                 INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  question_id             INTEGER NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  status                  VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'SOLVED')),
  started_at              TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,
  leetcode_submission_url TEXT,
  notes                   TEXT,
  favorite                BOOLEAN NOT NULL DEFAULT FALSE,
  revision_count          INTEGER NOT NULL DEFAULT 0,
  last_revised_at         TIMESTAMPTZ,
  PRIMARY KEY (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_user_question_progress_user_id ON user_question_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_question_progress_question_id ON user_question_progress (question_id);
CREATE INDEX IF NOT EXISTS idx_user_question_progress_status ON user_question_progress (status);
