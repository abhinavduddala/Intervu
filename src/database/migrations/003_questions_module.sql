-- Normalized lookup tables
CREATE TABLE IF NOT EXISTS topics (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patterns (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id                 SERIAL PRIMARY KEY,
  title              VARCHAR(255) NOT NULL,
  topic_id           INTEGER NOT NULL REFERENCES topics (id) ON DELETE RESTRICT,
  pattern_id         INTEGER NOT NULL REFERENCES patterns (id) ON DELETE RESTRICT,
  difficulty         VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  leetcode_url       VARCHAR(500),
  video_solution_url VARCHAR(500),
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topics_name ON topics (name);
CREATE INDEX IF NOT EXISTS idx_patterns_name ON patterns (name);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions (topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_pattern_id ON questions (pattern_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions (difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_title_lower ON questions (LOWER(title));
