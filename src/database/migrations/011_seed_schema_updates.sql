-- Migration: Update Questions Table for Seeding Metadata
-- Adds learning_order, prerequisites, recommended_next, acceptance_rate, and revision_priority

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS learning_order INTEGER,
  ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS recommended_next JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS acceptance_rate NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS revision_priority INTEGER;
