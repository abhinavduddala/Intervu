-- Migration: Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  question_id         INTEGER NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  recommendation_type VARCHAR(100) NOT NULL,
  priority            INTEGER NOT NULL,
  score               NUMERIC(5, 2) NOT NULL CHECK (score >= 0.00 AND score <= 100.00),
  reason              TEXT NOT NULL,
  generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  completed           BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations (user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_expires_at ON recommendations (expires_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_completed ON recommendations (completed);
