-- Migration: Create ai_analysis table
CREATE TABLE IF NOT EXISTS ai_analysis (
  id                      SERIAL PRIMARY KEY,
  submission_id           INTEGER NOT NULL UNIQUE REFERENCES submissions (id) ON DELETE CASCADE,
  user_id                 INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  question_id             INTEGER NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  detected_language       VARCHAR(100) NOT NULL,
  time_complexity         VARCHAR(50) NOT NULL,
  space_complexity        VARCHAR(50) NOT NULL,
  complexity_explanation  TEXT NOT NULL,
  optimized_code          TEXT NOT NULL,
  optimization_summary    TEXT NOT NULL,
  interview_feedback      JSONB NOT NULL,
  edge_cases              JSONB NOT NULL DEFAULT '[]',
  alternative_approach    TEXT,
  ai_model                VARCHAR(100) NOT NULL,
  tokens_used             INTEGER NOT NULL,
  processing_time         NUMERIC(8, 3) NOT NULL, -- Processing time in seconds
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_submission_id ON ai_analysis (submission_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_id ON ai_analysis (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_question_id ON ai_analysis (question_id);
