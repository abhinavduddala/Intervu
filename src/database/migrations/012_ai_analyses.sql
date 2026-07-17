-- Migration: Create ai_analyses table
CREATE TABLE IF NOT EXISTS ai_analyses (
  id                      SERIAL PRIMARY KEY,
  user_id                 INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  question_id             INTEGER NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  language                VARCHAR(50) NOT NULL,
  submitted_code          TEXT NOT NULL,
  analysis_result         JSONB NOT NULL,
  model_name              VARCHAR(100) NOT NULL,
  provider                VARCHAR(50) NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance and quick history lookups
CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_id ON ai_analyses (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_question_id ON ai_analyses (question_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON ai_analyses (created_at);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_question ON ai_analyses (user_id, question_id);
