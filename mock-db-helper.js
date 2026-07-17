const fs = require('fs');
const path = require('path');

// 1. Load environment variables at the very beginning so middleware gets process.env.CLIENT_URL
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
console.log(`✔ Mock DB Helper loaded .env. CLIENT_URL is: ${process.env.CLIENT_URL}`);

// Paths to persisted json files
const usersPath = path.resolve(__dirname, 'mock-db.json');
const progressPath = path.resolve(__dirname, 'mock-progress.json');
const submissionsPath = path.resolve(__dirname, 'mock-submissions.json');
const aiAnalysisPath = path.resolve(__dirname, 'mock-ai-analysis.json');
const readinessPath = path.resolve(__dirname, 'mock-readiness.json');
const recommendationsPath = path.resolve(__dirname, 'mock-recommendations.json');
const revisionPath = path.resolve(__dirname, 'mock-revision.json');
const questionsPath = path.resolve(__dirname, 'mock-questions.json');

// Safe read/write helpers
const readJson = (file, fallback = []) => {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (err) {
    console.error(`[Mock DB] Error reading ${path.basename(file)}:`, err);
  }
  return fallback;
};

const writeJson = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[Mock DB] Error writing ${path.basename(file)}:`, err);
  }
};

// Seed Lookups
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

const defaultQuestions = [
  {
    id: 1,
    title: 'Two Sum',
    slug: 'two-sum',
    topic_id: 9,
    topic_name: 'Arrays & Hashing',
    pattern_id: 1,
    pattern_name: 'Two Pointers',
    difficulty: 'easy',
    leetcode_url: 'https://leetcode.com/problems/two-sum/',
    source: 'leetcode',
    source_url: 'https://leetcode.com/problems/two-sum/',
    video_solution_url: 'https://www.youtube.com/watch?v=KLlXCFG5Tk0',
    article_url: 'https://leetcode.com/problems/two-sum/editorial/',
    notes: 'Simple hash map solution is O(N) runtime.',
    company_tags: ['Google', 'Amazon', 'Microsoft'],
    estimated_time: 15,
    created_at: '2026-06-01T00:00:00.000Z',
    updated_at: '2026-06-01T00:00:00.000Z'
  },
  {
    id: 2,
    title: 'LRU Cache',
    slug: 'lru-cache',
    topic_id: 2,
    topic_name: 'Design',
    pattern_id: 2,
    pattern_name: 'Doubly Linked List',
    difficulty: 'medium',
    leetcode_url: 'https://leetcode.com/problems/lru-cache/',
    source: 'leetcode',
    source_url: 'https://leetcode.com/problems/lru-cache/',
    video_solution_url: 'https://www.youtube.com/watch?v=7V3yEK_gLcM',
    article_url: 'https://leetcode.com/problems/lru-cache/editorial/',
    notes: 'Requires combination of double linked list and hash map.',
    company_tags: ['Amazon', 'Microsoft', 'Uber'],
    estimated_time: 30,
    created_at: '2026-06-02T00:00:00.000Z',
    updated_at: '2026-06-02T00:00:00.000Z'
  },
  {
    id: 3,
    title: 'Course Schedule II',
    slug: 'course-schedule-ii',
    topic_id: 3,
    topic_name: 'Graphs',
    pattern_id: 3,
    pattern_name: 'Topological Sort',
    difficulty: 'medium',
    leetcode_url: 'https://leetcode.com/problems/course-schedule-ii/',
    source: 'leetcode',
    source_url: 'https://leetcode.com/problems/course-schedule-ii/',
    video_solution_url: 'https://www.youtube.com/watch?v=Ee37u3CXjak',
    article_url: 'https://leetcode.com/problems/course-schedule-ii/editorial/',
    notes: 'Kahn\'s algorithm or DFS topological sort works.',
    company_tags: ['Google', 'Amazon'],
    estimated_time: 35,
    created_at: '2026-06-03T00:00:00.000Z',
    updated_at: '2026-06-03T00:00:00.000Z'
  },
  {
    id: 4,
    title: 'Merge k Sorted Lists',
    slug: 'merge-k-sorted-lists',
    topic_id: 4,
    topic_name: 'Heaps',
    pattern_id: 4,
    pattern_name: 'Divide and Conquer',
    difficulty: 'hard',
    leetcode_url: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    source: 'leetcode',
    source_url: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    video_solution_url: 'https://www.youtube.com/watch?v=kpCesr9VXDA',
    article_url: 'https://leetcode.com/problems/merge-k-sorted-lists/editorial/',
    notes: 'Use a min-heap or divide-and-conquer merge.',
    company_tags: ['Amazon', 'Google', 'Meta'],
    estimated_time: 45,
    created_at: '2026-06-04T00:00:00.000Z',
    updated_at: '2026-06-04T00:00:00.000Z'
  },
  {
    id: 5,
    title: 'Longest Palindromic Substring',
    slug: 'longest-palindromic-substring',
    topic_id: 5,
    topic_name: 'Dynamic Programming',
    pattern_id: 5,
    pattern_name: 'Substrings',
    difficulty: 'medium',
    leetcode_url: 'https://leetcode.com/problems/longest-palindromic-substring/',
    source: 'leetcode',
    source_url: 'https://leetcode.com/problems/longest-palindromic-substring/',
    video_solution_url: 'https://www.youtube.com/watch?v=XYQec15jak8',
    article_url: 'https://leetcode.com/problems/longest-palindromic-substring/editorial/',
    notes: 'Expand around center runs in O(N^2) time and O(1) space.',
    company_tags: ['Microsoft', 'Goldman Sachs'],
    estimated_time: 30,
    created_at: '2026-06-05T00:00:00.000Z',
    updated_at: '2026-06-05T00:00:00.000Z'
  }
];

if (!fs.existsSync(questionsPath)) {
  writeJson(questionsPath, defaultQuestions);
}

const filterQuestions = (questionsList, sql, params) => {
  let list = [...questionsList];

  // 1. Topic ID Filter (including compound topic OR pattern matches)
  const topicOrPatternMatch3 = sql.match(/\(q\.topic_id = \$(\d+) OR q\.pattern_id = \$(\d+) OR q\.pattern_id = \$(\d+)\)/);
  const topicOrPatternMatch = sql.match(/\(q\.topic_id = \$(\d+) OR q\.pattern_id = \$(\d+)\)/);
  
  if (topicOrPatternMatch3) {
    const tIdVal = Number(params[Number(topicOrPatternMatch3[1]) - 1]);
    const pIdVal1 = Number(params[Number(topicOrPatternMatch3[2]) - 1]);
    const pIdVal2 = Number(params[Number(topicOrPatternMatch3[3]) - 1]);
    list = list.filter(q => Number(q.topic_id) === tIdVal || Number(q.pattern_id) === pIdVal1 || Number(q.pattern_id) === pIdVal2);
  } else if (topicOrPatternMatch) {
    const tIdVal = Number(params[Number(topicOrPatternMatch[1]) - 1]);
    const pIdVal = Number(params[Number(topicOrPatternMatch[2]) - 1]);
    list = list.filter(q => Number(q.topic_id) === tIdVal || Number(q.pattern_id) === pIdVal);
  } else {
    const topicIdMatch = sql.match(/q\.topic_id = \$(\d+)/);
    if (topicIdMatch) {
      const topicIdVal = Number(params[Number(topicIdMatch[1]) - 1]);
      list = list.filter(q => Number(q.topic_id) === topicIdVal);
    } else {
      // Fallback to topic name LOWER(t.name) = LOWER($N)
      const topicMatch = sql.match(/LOWER\(t\.name\) = LOWER\(\$(\d+)\)/);
      if (topicMatch) {
        const topicVal = String(params[Number(topicMatch[1]) - 1]).toLowerCase();
        list = list.filter(q => q.topic_name && q.topic_name.toLowerCase() === topicVal);
      }
    }
  }

  // 2. Pattern ID Filter
  if (!topicOrPatternMatch && !topicOrPatternMatch3) {
    const patternIdMatch = sql.match(/q\.pattern_id = \$(\d+)/);
    if (patternIdMatch) {
      const patternIdVal = Number(params[Number(patternIdMatch[1]) - 1]);
      list = list.filter(q => Number(q.pattern_id) === patternIdVal);
    } else {
      // Fallback to pattern name LOWER(p.name) = LOWER($N)
      const patternMatch = sql.match(/LOWER\(p\.name\) = LOWER\(\$(\d+)\)/);
      if (patternMatch) {
        const patternVal = String(params[Number(patternMatch[1]) - 1]).toLowerCase();
        list = list.filter(q => q.pattern_name && q.pattern_name.toLowerCase() === patternVal);
      }
    }
  }

  // 3. Difficulty Filter
  const diffMatch = sql.match(/q\.difficulty = \$(\d+)/);
  if (diffMatch) {
    const diffVal = String(params[Number(diffMatch[1]) - 1]).toLowerCase();
    list = list.filter(q => q.difficulty && q.difficulty.toLowerCase() === diffVal);
  }

  // 4. Search Filter
  const searchMatch = sql.match(/q\.title ILIKE \$(\d+)/);
  if (searchMatch) {
    const searchVal = String(params[Number(searchMatch[1]) - 1]).replace(/%/g, '').toLowerCase();
    list = list.filter(q => q.title && q.title.toLowerCase().includes(searchVal));
  }

  return list;
};

class MockPool {
  constructor(config) {
    console.log("✔ Mock PostgreSQL Pool loaded via Node pre-load interceptor.");
  }
  on(event, callback) {
    return this;
  }
  async end() {
    console.log("✔ Mock PostgreSQL Pool ended.");
  }
  async connect() {
    return {
      query: async (text, params) => this.query(text, params),
      release: () => {}
    };
  }
  async query(text, params) {
    console.log(`[Mock DB Query]:`, text, params);
    const sql = text.trim().replace(/\s+/g, ' ');

    // Read latest states on each query to stay in sync
    const users = readJson(usersPath);
    const progressList = readJson(progressPath);
    const submissions = readJson(submissionsPath);
    const analyses = readJson(aiAnalysisPath);
    const readiness = readJson(readinessPath);
    const recommendations = readJson(recommendationsPath);
    const revisionQueue = readJson(revisionPath);
    const currentQuestions = readJson(questionsPath, defaultQuestions);

    try {
      // --- USERS TABLE ---
      if (sql.includes("INSERT INTO users")) {
        const email = params[0];
        const passwordHash = params[1];
        const role = params[2] || 'user';
        const newUser = {
          id: users.length + 1,
          email,
          password_hash: passwordHash,
          role,
          name: null,
          profile_picture_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        users.push(newUser);
        writeJson(usersPath, users);
        return { rows: [newUser] };
      }

      if (sql.includes("FROM users WHERE email = $1")) {
        const found = users.find(u => u.email === params[0]);
        return { rows: found ? [found] : [] };
      }

      if (sql.includes("FROM users WHERE id = $1")) {
        const found = users.find(u => u.id === Number(params[0]));
        return { rows: found ? [found] : [] };
      }

      // --- AGGREGATE COUNT CHECKS ---
      if (sql.includes("FROM topics") && sql.includes("COUNT(q.id)")) {
        const list = topics.map(t => ({
          topic_name: t.name,
          total: currentQuestions.filter(q => q.topic_id === t.id).length
        }));
        return { rows: list };
      }
      if (sql.includes("FROM patterns") && sql.includes("COUNT(q.id)")) {
        const list = patterns.map(p => ({
          pattern_name: p.name,
          total: currentQuestions.filter(q => q.pattern_id === p.id).length
        }));
        return { rows: list };
      }

      // --- ROADMAP DATA JOIN ---
      if (sql.includes("FROM questions q") && sql.includes("LEFT JOIN user_question_progress uqp")) {
        const userId = Number(params[0]);
        const list = currentQuestions.map(q => {
          const prog = progressList.find(p => p.user_id === userId && p.question_id === q.id) || {};
          return {
            id: q.id,
            title: q.title,
            slug: q.slug,
            difficulty: q.difficulty,
            leetcode_url: q.leetcode_url || q.source_url,
            video_solution_url: q.video_solution_url,
            notes: q.notes,
            created_at: q.created_at,
            updated_at: q.updated_at,
            source: q.source,
            source_url: q.source_url,
            article_url: q.article_url,
            company_tags: q.company_tags,
            estimated_time: q.estimated_time || q.estimated_time_minutes,
            learning_order: q.learning_order,
            prerequisites: q.prerequisites,
            recommended_next: q.recommended_next,
            topic_id: q.topic_id,
            topic_name: q.topic_name,
            pattern_id: q.pattern_id,
            pattern_name: q.pattern_name,
            progress_status: prog.status || 'NOT_STARTED',
            started_at: prog.started_at || null,
            completed_at: prog.completed_at || null
          };
        });

        // Sort by learning_order
        list.sort((a, b) => {
          const loA = a.learning_order !== null && a.learning_order !== undefined ? a.learning_order : 999999;
          const loB = b.learning_order !== null && b.learning_order !== undefined ? b.learning_order : 999999;
          return loA - loB;
        });

        return { rows: list };
      }

      // --- LOOKUPS ---
      if (sql.includes("FROM topics") && !sql.includes("WHERE") && !sql.includes("company_tags") && !sql.includes("revision_queue")) {
        return { rows: topics };
      }
      if (sql.includes("FROM patterns") && !sql.includes("WHERE") && !sql.includes("revision_queue")) {
        return { rows: patterns };
      }
      if (sql.includes("FROM topics") && sql.includes("LOWER(name) = LOWER($1)")) {
        const found = topics.find(t => t.name.toLowerCase() === params[0].toLowerCase());
        return { rows: found ? [found] : [] };
      }
      if (sql.includes("FROM patterns") && sql.includes("LOWER(name) = LOWER($1)")) {
        const found = patterns.find(p => p.name.toLowerCase() === params[0].toLowerCase());
        return { rows: found ? [found] : [] };
      }
      if (sql.includes("company_tags") && sql.includes("DISTINCT") && sql.includes("questions")) {
        const allTags = new Set();
        currentQuestions.forEach(q => {
          if (Array.isArray(q.company_tags)) {
            q.company_tags.forEach(tag => {
              if (tag) allTags.add(tag.trim());
            });
          }
        });
        const sortedCompanies = Array.from(allTags).sort().map(company => ({ company }));
        return { rows: sortedCompanies };
      }

      // --- QUESTIONS TABLE ---
      if (sql.includes("INSERT INTO questions") && sql.includes("learning_order")) {
        const topic = topics.find(t => t.id === Number(params[2])) || {};
        const pattern = patterns.find(p => p.id === Number(params[3])) || {};
        const newQuestion = {
          id: currentQuestions.length + 1,
          title: params[0],
          slug: params[1],
          topic_id: Number(params[2]),
          topic_name: topic.name || 'Unknown',
          pattern_id: Number(params[3]),
          pattern_name: pattern.name || 'Unknown',
          difficulty: params[4] ? params[4].toLowerCase() : 'easy',
          leetcode_url: params[9] || null,
          learning_order: params[5] ? Number(params[5]) : null,
          estimated_time: params[6] ? Number(params[6]) : null,
          estimated_time_minutes: params[6] ? Number(params[6]) : null,
          frequency: params[7],
          source: params[8] || 'leetcode',
          source_url: params[9],
          company_tags: Array.isArray(params[10]) ? params[10] : (params[10] ? params[10].replace(/[{}]/g, '').split(',') : []),
          video_solution_url: params[11] || '',
          article_url: params[12] || '',
          hint: params[13] || '',
          prerequisites: typeof params[14] === 'string' ? JSON.parse(params[14]) : params[14] || [],
          recommended_next: typeof params[15] === 'string' ? JSON.parse(params[15]) : params[15] || [],
          acceptance_rate: params[16] ? Number(params[16]) : null,
          revision_priority: params[17] ? Number(params[17]) : null,
          is_premium: params[18] === true || params[18] === 'true',
          is_active: params[19] === undefined ? true : (params[19] === true || params[19] === 'true'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        currentQuestions.push(newQuestion);
        writeJson(questionsPath, currentQuestions);
        return { rows: [newQuestion] };
      }

      if (sql.includes("INSERT INTO questions") && sql.includes("estimated_time_minutes")) {
        const topic = topics.find(t => t.id === Number(params[2])) || {};
        const pattern = patterns.find(p => p.id === Number(params[3])) || {};
        const newQuestion = {
          id: currentQuestions.length + 1,
          title: params[0],
          slug: params[1],
          topic_id: Number(params[2]),
          topic_name: topic.name || 'Unknown',
          pattern_id: Number(params[3]),
          pattern_name: pattern.name || 'Unknown',
          difficulty: params[4] ? params[4].toLowerCase() : 'easy',
          source: params[5] || 'leetcode',
          source_url: params[6],
          estimated_time: Number(params[7]),
          estimated_time_minutes: Number(params[7]),
          frequency: params[8],
          company_tags: Array.isArray(params[9]) ? params[9] : (params[9] ? params[9].replace(/[{}]/g, '').split(',') : []),
          video_solution_url: params[10] || '',
          article_url: params[11] || '',
          hint: params[12] || '',
          is_premium: params[13] === true || params[13] === 'true',
          is_active: params[14] === undefined ? true : (params[14] === true || params[14] === 'true'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        currentQuestions.push(newQuestion);
        writeJson(questionsPath, currentQuestions);
        return { rows: [newQuestion] };
      }

      if (sql.includes("FROM questions") && (sql.includes("slug = $1 OR LOWER(title) = LOWER($2)") || sql.includes("LOWER(title) = LOWER($1) OR slug = $2"))) {
        const p0 = params[0] ? params[0].toLowerCase() : '';
        const p1 = params[1] ? params[1].toLowerCase() : '';
        const found = currentQuestions.find(q => q.slug === params[0] || q.title.toLowerCase() === p1 || q.title.toLowerCase() === p0 || q.slug === params[1]);
        return { rows: found ? [found] : [] };
      }

      if (sql.includes("SELECT COUNT(*)::INTEGER AS total FROM questions q")) {
        const list = filterQuestions(currentQuestions, sql, params);
        return { rows: [{ total: list.length }] };
      }

      if (sql.includes("FROM questions") && !sql.includes("COUNT(")) {
        // Find single question by slug
        if (sql.includes("WHERE q.slug = $1")) {
          const found = currentQuestions.find(q => q.slug === params[0]);
          return { rows: found ? [found] : [] };
        }
        // Find single question by ID
        if (sql.includes("WHERE q.id = $1")) {
          const found = currentQuestions.find(q => q.id === Number(params[0]));
          return { rows: found ? [found] : [] };
        }
        // List questions (with filters)
        const list = filterQuestions(currentQuestions, sql, params);
        return { rows: list };
      }

      // --- SUBMISSIONS TABLE ---
      if (sql.includes("INSERT INTO submissions")) {
        // Insert submission record
        const newSub = {
          id: submissions.length + 1,
          user_id: Number(params[0]),
          question_id: Number(params[1]),
          source_code: params[2],
          language_id: Number(params[3]),
          status_id: 3, // Accepted
          status_description: 'Accepted',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        submissions.push(newSub);
        writeJson(submissionsPath, submissions);
        return { rows: [newSub] };
      }

      if (sql.includes("FROM submissions WHERE id = $1")) {
        const found = submissions.find(s => s.id === Number(params[0]));
        return { rows: found ? [found] : [] };
      }

      if (sql.includes("FROM submissions WHERE user_id = $1 AND question_id = $2")) {
        const list = submissions.filter(s => s.user_id === Number(params[0]) && s.question_id === Number(params[1]));
        return { rows: list };
      }

      // --- AI ANALYSIS TABLE ---
      if (sql.includes("INSERT INTO ai_analysis")) {
        const newAnalysis = {
          id: analyses.length + 1,
          submission_id: Number(params[0]),
          user_id: Number(params[1]),
          question_id: Number(params[2]),
          detected_language: params[3],
          time_complexity: params[4],
          space_complexity: params[5],
          complexity_explanation: params[6],
          optimized_code: params[7],
          optimization_summary: params[8],
          interview_feedback: typeof params[9] === 'string' ? JSON.parse(params[9]) : params[9],
          edge_cases: typeof params[10] === 'string' ? JSON.parse(params[10]) : params[10] || [],
          alternative_approach: params[11],
          ai_model: params[12],
          tokens_used: Number(params[13]),
          processing_time: Number(params[14]),
          created_at: new Date().toISOString()
        };
        analyses.push(newAnalysis);
        writeJson(aiAnalysisPath, analyses);
        return { rows: [newAnalysis] };
      }

      if (sql.includes("FROM ai_analysis WHERE submission_id = $1")) {
        const found = analyses.find(a => a.submission_id === Number(params[0]));
        return { rows: found ? [found] : [] };
      }

      // --- NEW AI ANALYSES TABLE (PLURAL) ---
      if (sql.includes("INSERT INTO ai_analyses")) {
        const record = {
          id: analyses.length + 1,
          user_id: Number(params[0]),
          question_id: Number(params[1]),
          language: params[2],
          submitted_code: params[3],
          analysis_result: typeof params[4] === 'string' ? JSON.parse(params[4]) : params[4],
          model_name: params[5],
          provider: params[6],
          created_at: new Date().toISOString()
        };
        analyses.push(record);
        writeJson(aiAnalysisPath, analyses);
        return { rows: [record] };
      }

      if (sql.includes("FROM ai_analyses")) {
        if (sql.includes("id = $") && !sql.includes("user_id = $") && !sql.includes("question_id = $")) {
          const found = analyses.find(a => a.id === Number(params[0]));
          return { rows: found ? [found] : [] };
        }
        if (sql.includes("user_id = $") && sql.includes("question_id = $")) {
          // Compound check: either user_id=p0 AND question_id=p1 OR user_id=p1 AND question_id=p0
          const userId = Number(params[0]);
          const questionId = Number(params[1]);
          const list = analyses.filter(a => a.user_id === userId && a.question_id === questionId);
          return { rows: list };
        }
        if (sql.includes("user_id = $")) {
          const list = analyses.filter(a => a.user_id === Number(params[0]));
          return { rows: list };
        }
        return { rows: analyses };
      }

      if (sql.includes("avg_ai_rating") && (sql.includes("FROM ai_analysis") || sql.includes("FROM ai_analyses"))) {
        const list = analyses.filter(a => a.user_id === Number(params[0]));
        let total = 0;
        let count = 0;
        list.forEach(a => {
          const rating = a.interview_feedback?.rating || (a.analysis_result?.confidenceScore ? Math.round(a.analysis_result.confidenceScore / 10) : 0);
          if (rating > 0) {
            total += rating;
            count++;
          }
        });
        const avg = count > 0 ? total / count : 0.0;
        return { rows: [{ avg_ai_rating: avg }] };
      }

      // --- USER QUESTION PROGRESS ---
      if (sql.includes("INSERT INTO user_question_progress")) {
        const userId = Number(params[0]);
        const questionId = Number(params[1]);
        const status = params[2] || 'NOT_STARTED';
        const startedAt = params[3];
        const completedAt = params[4];
        const leetcodeSubmissionUrl = params[5];
        const notes = params[6];
        const favorite = params[7] === true;
        const revisionCount = Number(params[8] || 0);
        const lastRevisedAt = params[9];

        const idx = progressList.findIndex(p => p.user_id === userId && p.question_id === questionId);
        const record = {
          id: idx >= 0 ? progressList[idx].id : progressList.length + 1,
          user_id: userId,
          question_id: questionId,
          status,
          started_at: startedAt ? new Date(startedAt).toISOString() : (idx >= 0 ? progressList[idx].started_at : null),
          completed_at: completedAt ? new Date(completedAt).toISOString() : (idx >= 0 ? progressList[idx].completed_at : null),
          leetcode_submission_url: leetcodeSubmissionUrl !== undefined ? leetcodeSubmissionUrl : (idx >= 0 ? progressList[idx].leetcode_submission_url : null),
          notes: notes !== undefined ? notes : (idx >= 0 ? progressList[idx].notes : null),
          favorite: favorite !== undefined ? favorite : (idx >= 0 ? progressList[idx].favorite : false),
          revision_count: revisionCount !== undefined ? revisionCount : (idx >= 0 ? progressList[idx].revision_count : 0),
          last_revised_at: lastRevisedAt ? new Date(lastRevisedAt).toISOString() : (idx >= 0 ? progressList[idx].last_revised_at : null)
        };

        if (idx >= 0) {
          progressList[idx] = record;
        } else {
          progressList.push(record);
        }
        writeJson(progressPath, progressList);
        return { rows: [record] };
      }

      if (sql.includes("FROM user_question_progress") && sql.includes("WHERE user_id = $1 AND question_id = $2")) {
        const found = progressList.find(p => p.user_id === Number(params[0]) && p.question_id === Number(params[1]));
        return { rows: found ? [found] : [] };
      }

      if (sql.includes("FROM user_question_progress") && sql.includes("WHERE user_id = $1") && !sql.includes("COUNT")) {
        const list = progressList.filter(p => p.user_id === Number(params[0]));
        return { rows: list };
      }

      // Overall metrics using user_question_progress
      if (sql.includes("total_attempts")) {
        // Rewrite submission-based overall metrics request into progress-based metrics
        const list = progressList.filter(p => p.user_id === Number(params[0]));
        const uniqueSolved = list.filter(p => p.status === 'SOLVED').length;
        const uniqueAttempted = list.filter(p => p.status !== 'NOT_STARTED').length;
        const totalRevisions = list.reduce((sum, p) => sum + (p.revision_count || 0), 0);
        return {
          rows: [{
            total_attempts: uniqueAttempted * 2, // simulated attempts
            accepted_attempts: uniqueSolved,
            unique_attempted: uniqueAttempted,
            unique_solved: uniqueSolved,
            avg_time: 0.045,
            avg_memory: 4500
          }]
        };
      }

      if (sql.includes("DATE_TRUNC") && sql.includes("submissions")) {
        // Streak dates
        const list = progressList.filter(p => p.user_id === Number(params[0]) && p.status === 'SOLVED');
        const submitDates = list.map(p => ({
          submit_date: p.completed_at || p.started_at || new Date().toISOString()
        }));
        return { rows: submitDates };
      }

      if (sql.includes("topics t") && sql.includes("submissions s")) {
        // Topic completions
        const userId = Number(params[0]);
        const list = topics.map(t => {
          const qInTopic = currentQuestions.filter(q => q.topic_id === t.id);
          const solvedInTopic = progressList.filter(p => p.user_id === userId && p.status === 'SOLVED' && qInTopic.some(q => q.id === p.question_id));
          return {
            topic_id: t.id,
            topic_name: t.name,
            total_questions: qInTopic.length,
            completed_questions: solvedInTopic.length
          };
        });
        return { rows: list };
      }

      if (sql.includes("patterns p") && sql.includes("submissions s")) {
        // Pattern completions
        const userId = Number(params[0]);
        const list = patterns.map(p => {
          const qInPattern = currentQuestions.filter(q => q.pattern_id === p.id);
          const solvedInPattern = progressList.filter(p => p.user_id === userId && p.status === 'SOLVED' && qInPattern.some(q => q.id === p.question_id));
          return {
            pattern_id: p.id,
            pattern_name: p.name,
            total_questions: qInPattern.length,
            completed_questions: solvedInPattern.length
          };
        });
        return { rows: list };
      }

      if (sql.includes("q.difficulty") && sql.includes("submissions s")) {
        // Difficulty completion
        const userId = Number(params[0]);
        const diffs = ['easy', 'medium', 'hard'];
        const list = diffs.map(diff => {
          const qInDiff = currentQuestions.filter(q => q.difficulty === diff);
          const solvedInDiff = progressList.filter(p => p.user_id === userId && p.status === 'SOLVED' && qInDiff.some(q => q.id === p.question_id));
          return {
            difficulty: diff,
            total_questions: qInDiff.length,
            completed_questions: solvedInDiff.length
          };
        });
        return { rows: list };
      }

      // --- COMPANY READINESS ---
      if (sql.includes("FROM company_readiness")) {
        const list = readiness.filter(r => r.user_id === Number(params[0]));
        if (sql.includes("company_name = LOWER($2)")) {
          const found = list.find(r => r.company_name.toLowerCase() === params[1].toLowerCase());
          return { rows: found ? [found] : [] };
        }
        return { rows: list };
      }

      if (sql.includes("INSERT INTO company_readiness")) {
        const record = {
          id: readiness.length + 1,
          user_id: Number(params[0]),
          company_name: params[1],
          readiness_score: Number(params[2]),
          strengths: typeof params[3] === 'string' ? JSON.parse(params[3]) : params[3],
          weak_topics: typeof params[4] === 'string' ? JSON.parse(params[4]) : params[4],
          last_updated: new Date().toISOString()
        };
        const idx = readiness.findIndex(r => r.user_id === record.user_id && r.company_name.toLowerCase() === record.company_name.toLowerCase());
        if (idx >= 0) {
          readiness[idx] = record;
        } else {
          readiness.push(record);
        }
        writeJson(readinessPath, readiness);
        return { rows: [record] };
      }

      // --- RECOMMENDATIONS TABLE ---
      if (sql.includes("FROM recommendations r")) {
        const list = recommendations.filter(r => r.user_id === Number(params[0]) && r.completed === false);
        return {
          rows: list.map(r => {
            const q = currentQuestions.find(q => q.id === r.question_id) || {};
            return {
              ...r,
              question_title: q.title,
              question_difficulty: q.difficulty,
              topic_name: q.topic_name,
              pattern_name: q.pattern_name
            };
          })
        };
      }

      if (sql.includes("INSERT INTO recommendations")) {
        const record = {
          id: recommendations.length + 1,
          user_id: Number(params[0]),
          question_id: Number(params[1]),
          recommendation_type: params[2],
          priority: Number(params[3]),
          score: Number(params[4]),
          reason: params[5],
          generated_at: new Date().toISOString(),
          expires_at: params[6] || new Date(Date.now() + 24*60*60*1000).toISOString(),
          completed: false
        };
        recommendations.push(record);
        writeJson(recommendationsPath, recommendations);
        return { rows: [record] };
      }

      if (sql.includes("DELETE FROM recommendations")) {
        const cleaned = recommendations.filter(r => !(r.user_id === Number(params[0]) && r.completed === false));
        writeJson(recommendationsPath, cleaned);
        return { rows: [] };
      }

      // --- REVISION QUEUE TABLE ---
      if (sql.includes("FROM revision_queue")) {
        const list = revisionQueue.filter(r => r.user_id === Number(params[0]) && r.status === 'active');
        return {
          rows: list.map(r => {
            const q = currentQuestions.find(q => q.id === r.question_id) || {};
            return {
              ...r,
              question_title: q.title,
              question_difficulty: q.difficulty,
              topic_name: q.topic_name,
              pattern_name: q.pattern_name
            };
          })
        };
      }

      if (sql.includes("INSERT INTO revision_queue") || sql.includes("upsert")) {
        // Upsert logic for revision
        const userId = Number(params[0]);
        const questionId = Number(params[1]);
        const stage = Number(params[2] || 1);
        const nextDate = params[3];
        const score = Number(params[4] || 50);
        const reason = params[5] || 'Practice Needed';

        const record = {
          id: revisionQueue.length + 1,
          user_id: userId,
          question_id: questionId,
          revision_stage: stage,
          next_revision_date: nextDate || new Date().toISOString(),
          last_revision_date: null,
          revision_count: 0,
          confidence_score: score,
          reason,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const idx = revisionQueue.findIndex(r => r.user_id === userId && r.question_id === questionId);
        if (idx >= 0) {
          revisionQueue[idx] = {
            ...revisionQueue[idx],
            revision_stage: stage,
            next_revision_date: record.next_revision_date,
            confidence_score: score,
            reason,
            status: 'active',
            updated_at: new Date().toISOString()
          };
        } else {
          revisionQueue.push(record);
        }
        writeJson(revisionPath, revisionQueue);
        return { rows: [record] };
      }

      // Default fallback return
      return { rows: [] };
    } catch (err) {
      console.error("[Mock DB Error]:", err);
      throw err;
    }
  }
}

// Inject into require cache
const pgPath = require.resolve('pg');
require.cache[pgPath] = {
  id: pgPath,
  filename: pgPath,
  loaded: true,
  exports: {
    Pool: MockPool
  }
};
console.log("✔ Global PostgreSQL require cache intercepted.");
