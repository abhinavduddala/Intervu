-- Migration: Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  question_id         INTEGER NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  source_code         TEXT NOT NULL,
  language_id         INTEGER NOT NULL,
  stdin               TEXT,
  expected_output     TEXT,
  judge0_token        VARCHAR(100),
  status_id           INTEGER,
  status_description  VARCHAR(100),
  stdout              TEXT,
  stderr              TEXT,
  compile_output      TEXT,
  execution_time      NUMERIC(8, 4), -- Execution time in seconds
  execution_memory    INTEGER,      -- Execution memory in KB
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_question_id ON submissions (question_id);
CREATE INDEX IF NOT EXISTS idx_submissions_judge0_token ON submissions (judge0_token);
