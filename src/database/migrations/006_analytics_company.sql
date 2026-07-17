-- Migration: Create company weights and readiness tables
CREATE TABLE IF NOT EXISTS company_topic_weights (
  id          SERIAL PRIMARY KEY,
  company_name VARCHAR(100) NOT NULL,
  topic_id    INTEGER NOT NULL REFERENCES topics (id) ON DELETE CASCADE,
  weight      NUMERIC(3, 2) NOT NULL CHECK (weight >= 0.00 AND weight <= 1.00),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_company_topic UNIQUE (company_name, topic_id)
);

CREATE TABLE IF NOT EXISTS company_readiness (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  company_name    VARCHAR(100) NOT NULL,
  readiness_score NUMERIC(5, 2) NOT NULL CHECK (readiness_score >= 0.00 AND readiness_score <= 100.00),
  strengths       JSONB NOT NULL DEFAULT '[]',
  weak_topics     JSONB NOT NULL DEFAULT '[]',
  last_updated    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_company_readiness UNIQUE (user_id, company_name)
);

CREATE INDEX IF NOT EXISTS idx_company_topic_weights_company ON company_topic_weights (company_name);
CREATE INDEX IF NOT EXISTS idx_company_readiness_user ON company_readiness (user_id);
