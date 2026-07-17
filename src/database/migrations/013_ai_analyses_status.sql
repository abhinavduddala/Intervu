-- Migration: Add status and allow nullable results in ai_analyses table
ALTER TABLE ai_analyses ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'completed';
ALTER TABLE ai_analyses ALTER COLUMN analysis_result DROP NOT NULL;
ALTER TABLE ai_analyses ALTER COLUMN model_name DROP NOT NULL;
ALTER TABLE ai_analyses ALTER COLUMN provider DROP NOT NULL;
