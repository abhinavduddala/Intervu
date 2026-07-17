-- Migration: Add missing metadata fields to questions table for the import system
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS estimated_time_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS frequency VARCHAR(50),
  ADD COLUMN IF NOT EXISTS hint TEXT,
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Seed additional topics for NeetCode 150
INSERT INTO topics (name) VALUES 
  ('Arrays & Hashing'), 
  ('Two Pointers'), 
  ('Sliding Window'), 
  ('Stack'), 
  ('Binary Search'), 
  ('Linked List'), 
  ('Trie'), 
  ('Backtracking'), 
  ('Advanced Graphs'), 
  ('1-D DP'), 
  ('2-D DP'), 
  ('Greedy'), 
  ('Intervals'), 
  ('Math & Geometry'), 
  ('Bit Manipulation')
ON CONFLICT (name) DO NOTHING;

-- Seed additional patterns for NeetCode 150
INSERT INTO patterns (name) VALUES
  ('Hash Map'), 
  ('Hash Set'), 
  ('Stack'), 
  ('Linked List'), 
  ('Recursion'), 
  ('Dynamic Programming'), 
  ('Greedy'), 
  ('Bit Manipulation'), 
  ('Fast & Slow Pointers'), 
  ('In-place Reversal'), 
  ('Breadth First Search'), 
  ('Depth First Search'), 
  ('Prefix Tree'), 
  ('Union Find'), 
  ('Heaps / Priority Queue'),
  ('Frequency Counting'),
  ('Sorting'),
  ('Queue'),
  ('Heap'),
  ('Bucket Sort'),
  ('Merge Intervals'),
  ('Prefix Sum'),
  ('Simulation'),
  ('Monotonic Stack'),
  ('Matrix Traversal'),
  ('Trie'),
  ('DFS'),
  ('BFS'),
  ('Memoization')
ON CONFLICT (name) DO NOTHING;

