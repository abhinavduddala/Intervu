-- Migration: Create revision_queue table
CREATE TABLE IF NOT EXISTS revision_queue (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  question_id         INTEGER NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  revision_stage      INTEGER NOT NULL DEFAULT 1 CHECK (revision_stage >= 1 AND revision_stage <= 5),
  next_revision_date  TIMESTAMPTZ NOT NULL,
  last_revision_date  TIMESTAMPTZ,
  revision_count      INTEGER NOT NULL DEFAULT 0,
  confidence_score    INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  reason              VARCHAR(255) NOT NULL,
  status              VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_revision_queue_user_id ON revision_queue (user_id);
CREATE INDEX IF NOT EXISTS idx_revision_queue_next_revision ON revision_queue (next_revision_date);
CREATE INDEX IF NOT EXISTS idx_revision_queue_status ON revision_queue (status);
