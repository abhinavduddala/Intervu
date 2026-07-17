-- Migration: Add slug to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Generate slugs for any existing questions
UPDATE questions 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^\w\s\-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Resolve conflicts for any duplicates that exist in the database
UPDATE questions q1
SET slug = q1.slug || '-' || q1.id
WHERE EXISTS (
  SELECT 1 FROM questions q2 
  WHERE q2.slug = q1.slug AND q2.id <> q1.id
);

-- Apply NOT NULL constraint now that all slugs are populated
ALTER TABLE questions ALTER COLUMN slug SET NOT NULL;
