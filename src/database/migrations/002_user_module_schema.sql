-- Profile fields on users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(500);

-- User placement targets (1:1 with users)
CREATE TABLE IF NOT EXISTS user_targets (
  user_id                   INTEGER PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  target_companies          TEXT[] NOT NULL DEFAULT '{}',
  placement_timeline        VARCHAR(100),
  target_preparation_level  VARCHAR(50),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User preferences (1:1 with users)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id              INTEGER PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  preferred_language   VARCHAR(50),
  preferred_difficulty VARCHAR(50),
  dashboard_settings   JSONB NOT NULL DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
