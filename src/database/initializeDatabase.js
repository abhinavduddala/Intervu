const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const topics = [
  { id: 2, name: 'Design' },
  { id: 3, name: 'Graphs' },
  { id: 4, name: 'Heaps' },
  { id: 5, name: 'Dynamic Programming' },
  { id: 6, name: 'Trees' },
  { id: 7, name: 'Stacks' },
  { id: 8, name: 'Linked Lists' },
  { id: 9, name: 'Arrays & Hashing' },
  { id: 10, name: 'Two Pointers' },
  { id: 11, name: 'Sliding Window' },
  { id: 13, name: 'Binary Search' },
  { id: 15, name: 'Trie' },
  { id: 16, name: 'Backtracking' },
  { id: 17, name: 'Advanced Graphs' },
  { id: 18, name: '1-D DP' },
  { id: 19, name: '2-D DP' },
  { id: 20, name: 'Greedy' },
  { id: 21, name: 'Intervals' },
  { id: 22, name: 'Math & Geometry' },
  { id: 23, name: 'Bit Manipulation' }
];

const patterns = [
  { id: 1, name: 'Two Pointers' },
  { id: 2, name: 'Doubly Linked List' },
  { id: 3, name: 'Topological Sort' },
  { id: 4, name: 'Divide and Conquer' },
  { id: 5, name: 'Substrings' },
  { id: 6, name: 'DFS/BFS' },
  { id: 7, name: 'Binary Search' },
  { id: 8, name: 'Sliding Window' },
  { id: 9, name: 'Hash Map' },
  { id: 10, name: 'Hash Set' },
  { id: 11, name: 'Stack' },
  { id: 12, name: 'Linked List' },
  { id: 13, name: 'Recursion' },
  { id: 14, name: 'Dynamic Programming' },
  { id: 15, name: 'Greedy' },
  { id: 16, name: 'Bit Manipulation' },
  { id: 17, name: 'Fast & Slow Pointers' },
  { id: 18, name: 'In-place Reversal' },
  { id: 19, name: 'Breadth First Search' },
  { id: 20, name: 'Depth First Search' },
  { id: 21, name: 'Prefix Tree' },
  { id: 22, name: 'Union Find' },
  { id: 23, name: 'Heaps / Priority Queue' },
  { id: 24, name: 'Frequency Counting' },
  { id: 25, name: 'Sorting' },
  { id: 26, name: 'Queue' },
  { id: 27, name: 'Heap' },
  { id: 28, name: 'Bucket Sort' },
  { id: 29, name: 'Merge Intervals' },
  { id: 30, name: 'Prefix Sum' },
  { id: 31, name: 'Simulation' },
  { id: 32, name: 'Monotonic Stack' },
  { id: 33, name: 'Matrix Traversal' },
  { id: 34, name: 'Trie' },
  { id: 35, name: 'DFS' },
  { id: 36, name: 'BFS' },
  { id: 37, name: 'Memoization' }
];

const initializeDatabase = async () => {
  console.log('🔄 Initializing real PostgreSQL database...');
  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    // 1. Create schema migrations tracker table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Run pending SQL migrations
    const migrationsDir = path.resolve(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query('SELECT 1 FROM schema_migrations WHERE version = $1', [file]);
      if (rows.length === 0) {
        console.log(`  Executing migration: ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`  ✔ Migration ${file} run successfully.`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`  💥 Migration ${file} failed:`, err.message);
          throw err;
        }
      }
    }

    // 3. Seed lookup tables only on first boot. Truncating on every start
    //    cascaded into submissions, ai_analyses and user progress and wiped
    //    all user data (AI history, readiness) on each restart.
    const { rows: [{ count: existingQuestions }] } = await client.query('SELECT COUNT(*)::INTEGER AS count FROM questions');
    if (existingQuestions === 0) {
      console.log('🔄 Empty database detected. Resetting topics and patterns lookup tables...');
      await client.query('TRUNCATE TABLE questions, topics, patterns RESTART IDENTITY CASCADE;');

      console.log('🌱 Seeding topics lookup data...');
      for (const t of topics) {
        await client.query(`
          INSERT INTO topics (id, name)
          VALUES ($1, $2)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
        `, [t.id, t.name]);
      }

      console.log('🌱 Seeding patterns lookup data...');
      for (const p of patterns) {
        await client.query(`
          INSERT INTO patterns (id, name)
          VALUES ($1, $2)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
        `, [p.id, p.name]);
      }

      await client.query(`SELECT setval(pg_get_serial_sequence('topics', 'id'), (SELECT MAX(id) FROM topics))`);
      await client.query(`SELECT setval(pg_get_serial_sequence('patterns', 'id'), (SELECT MAX(id) FROM patterns))`);
    } else {
      console.log(`✔ ${existingQuestions} questions already present. Preserving user data and lookup tables.`);
    }

    // 5. Seed canonical questions
    const questionsPath = path.resolve(__dirname, '../../mock-questions.json');
    if (fs.existsSync(questionsPath)) {
      console.log('🌱 Seeding aligned questions database...');
      const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
      for (const q of questions) {
        await client.query(`
          INSERT INTO questions (
            id, title, slug, topic_id, pattern_id, difficulty, leetcode_url,
            source, source_url, article_url, notes, company_tags, estimated_time,
            learning_order, prerequisites, recommended_next, acceptance_rate, revision_priority,
            created_at, updated_at, hint, frequency
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
            $14, $15, $16, $17, $18, COALESCE($19, NOW()), COALESCE($20, NOW()), $21, $22
          )
          ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title,
            topic_id = EXCLUDED.topic_id,
            pattern_id = EXCLUDED.pattern_id,
            difficulty = EXCLUDED.difficulty,
            leetcode_url = EXCLUDED.leetcode_url,
            source = EXCLUDED.source,
            source_url = EXCLUDED.source_url,
            article_url = EXCLUDED.article_url,
            notes = EXCLUDED.notes,
            company_tags = EXCLUDED.company_tags,
            estimated_time = EXCLUDED.estimated_time,
            learning_order = EXCLUDED.learning_order,
            prerequisites = EXCLUDED.prerequisites,
            recommended_next = EXCLUDED.recommended_next,
            acceptance_rate = EXCLUDED.acceptance_rate,
            revision_priority = EXCLUDED.revision_priority,
            hint = COALESCE(EXCLUDED.hint, questions.hint),
            frequency = COALESCE(EXCLUDED.frequency, questions.frequency),
            updated_at = NOW();
        `, [
          q.id,
          q.title,
          q.slug,
          q.topic_id,
          q.pattern_id,
          q.difficulty,
          q.leetcode_url || null,
          q.source || 'leetcode',
          q.source_url || null,
          q.article_url || null,
          q.notes || null,
          q.company_tags || [],
          q.estimated_time || 0,
          q.learning_order || null,
          JSON.stringify(q.prerequisites || []),
          JSON.stringify(q.recommended_next || []),
          q.acceptance_rate || null,
          q.revision_priority || null,
          q.created_at || null,
          q.updated_at || null,
          q.hint || null,
          q.frequency || null
        ]);
      }
      await client.query(`SELECT setval(pg_get_serial_sequence('questions', 'id'), (SELECT COALESCE(MAX(id), 1) FROM questions))`);
      console.log(`  ✔ Seeded ${questions.length} questions.`);
    }

    console.log('🎉 Database initialization complete!');
  } catch (err) {
    console.error('💥 Database initialization failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

if (require.main === module) {
  initializeDatabase().catch(() => process.exit(1));
}

module.exports = initializeDatabase;
