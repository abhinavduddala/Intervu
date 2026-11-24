-- Migration: In-app coding workspace (problem content, multi-test submissions, AI error tracking)

-- AI-generated problem statement, test cases and starter templates, cached per question
CREATE TABLE IF NOT EXISTS question_problem_content (
  question_id  INTEGER PRIMARY KEY REFERENCES questions (id) ON DELETE CASCADE,
  content      JSONB NOT NULL,
  model_name   VARCHAR(100),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Submissions now run a full test-case suite in a named language
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS language      VARCHAR(30),
  ADD COLUMN IF NOT EXISTS test_results  JSONB,
  ADD COLUMN IF NOT EXISTS passed_count  INTEGER,
  ADD COLUMN IF NOT EXISTS total_count   INTEGER;

-- Surface the reason an AI analysis failed instead of a generic message
ALTER TABLE ai_analyses
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS submission_id INTEGER REFERENCES submissions (id) ON DELETE SET NULL;
