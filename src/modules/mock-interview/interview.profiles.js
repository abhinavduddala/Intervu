/**
 * Static configuration for AI mock interviews: the options offered on the setup
 * page and the guidance that shapes the interviewer for each type and company.
 * Company guidance describes publicly known interview styles only.
 */

const INTERVIEW_TYPES = {
  technical: {
    label: 'Technical Interview',
    focus: 'core programming concepts, problem solving, data structures and practical engineering judgement',
    sections: ['Introduction', 'Technical fundamentals', 'Problem solving', 'Wrap-up'],
  },
  dsa: {
    label: 'Data Structures and Algorithms',
    focus: 'arrays, hashing, two pointers, trees, graphs, dynamic programming, complexity analysis and edge cases. Ask the candidate to describe approaches, trade-offs and complexity in words or short pseudocode',
    sections: ['Introduction', 'Warm-up problem', 'Core problem', 'Optimisation and edge cases', 'Wrap-up'],
    usesLanguage: true,
  },
  core_cs: {
    label: 'Core Computer Science',
    focus: 'operating systems, computer networks, database management systems, OOP and basic computer architecture',
    sections: ['Introduction', 'Operating systems', 'Databases', 'Networks', 'OOP', 'Wrap-up'],
  },
  language: {
    label: 'Language Interview (Java / Python / JavaScript)',
    focus: 'deep knowledge of the selected programming language: its type system, memory model, concurrency, standard library, idioms and common pitfalls',
    sections: ['Introduction', 'Language fundamentals', 'Advanced features', 'Practical scenarios', 'Wrap-up'],
    usesLanguage: true,
    requiresLanguage: true,
  },
  backend: {
    label: 'Backend Development',
    focus: 'API design, databases and indexing, caching, authentication, concurrency, queues, error handling and scalability basics',
    sections: ['Introduction', 'APIs and HTTP', 'Data and storage', 'Reliability and scaling', 'Wrap-up'],
    usesLanguage: true,
  },
  frontend: {
    label: 'Frontend Development',
    focus: 'HTML, CSS, JavaScript, browser rendering, React or similar frameworks, state management, performance and accessibility',
    sections: ['Introduction', 'Web fundamentals', 'Frameworks and state', 'Performance and accessibility', 'Wrap-up'],
  },
  full_stack: {
    label: 'Full Stack Development',
    focus: 'end-to-end web application design across frontend, backend, database and deployment',
    sections: ['Introduction', 'Frontend', 'Backend and APIs', 'Data and deployment', 'Wrap-up'],
  },
  system_design: {
    label: 'System Design',
    focus: 'requirements gathering, high-level architecture, data modelling, scaling, caching, consistency and trade-offs. Scale the problem to the experience level',
    sections: ['Introduction', 'Requirements', 'High-level design', 'Deep dive', 'Trade-offs', 'Wrap-up'],
  },
  behavioral: {
    label: 'HR / Behavioral Interview',
    focus: 'teamwork, ownership, conflict, failure and learning, motivation and communication. Expect STAR-style answers and probe for specifics',
    sections: ['Introduction', 'Background and motivation', 'Behavioral scenarios', 'Wrap-up'],
    behavioral: true,
  },
  project: {
    label: 'Project-Based Interview',
    focus: "the candidate's own projects: architecture, technology choices, their personal contribution, challenges, trade-offs and what they would improve",
    sections: ['Introduction', 'Project overview', 'Technical deep dive', 'Challenges and decisions', 'Wrap-up'],
  },
  mixed: {
    label: 'Mixed Technical Interview',
    focus: 'a balanced mix of DSA, core computer science, role-specific technical questions and one or two behavioral questions',
    sections: ['Introduction', 'DSA', 'Core CS', 'Role-specific', 'Behavioral', 'Wrap-up'],
    usesLanguage: true,
  },
};

const COMPANIES = {
  Amazon: 'Values structured problem solving and customer focus. Behavioral questions follow its publicly documented leadership principles (ownership, bias for action, dive deep). Expects clear complexity analysis.',
  Google: 'Emphasises algorithmic depth, clean reasoning, complexity analysis and exploring follow-up variations of a problem. Interviewers often push for an optimal solution after a working one.',
  Microsoft: 'Balanced focus on fundamentals, problem solving and collaboration. Often asks the candidate to walk through test cases and edge cases.',
  Meta: 'Fast-paced problem solving, usually two problems per round, with emphasis on getting to a working optimal approach quickly and communicating while thinking.',
  Apple: 'Focus on depth in the role domain, attention to detail, quality and practical engineering decisions. Expects candidates to defend design choices.',
  Adobe: 'Strong fundamentals in DSA, OOP and core CS, with practical coding and puzzle-style reasoning questions.',
  Oracle: 'Fundamentals-heavy: DSA, databases and SQL, OOP and operating systems, plus questions on past projects.',
  Deloitte: 'Mix of technical fundamentals, project discussion and client-facing communication. Behavioral and situational questions carry significant weight.',
  Qualcomm: 'Strong emphasis on C/C++ fundamentals, operating systems, memory, bit manipulation and computer architecture basics.',
  Uber: 'Practical problem solving with real-world flavour, graphs and scalability awareness, and ownership in behavioral questions.',
  Flipkart: 'Problem solving and DSA depth (often medium to hard), machine coding style design questions and scalability awareness.',
  IBM: 'Balanced loop of coding fundamentals (DSA, OOP), databases and SQL, plus project discussion and teamwork-focused behavioral questions. Cloud and enterprise awareness is a plus for experienced roles.',
  'Goldman Sachs': 'DSA and math-oriented problem solving, with attention to correctness and precision.',
  Atlassian: 'Practical coding, collaboration and values-based behavioral questions.',
  Netflix: 'Senior-leaning expectations: strong ownership, judgement and clear trade-off discussion.',
  'Generic Product-Based Company': 'Standard product-company loop: DSA problem solving, fundamentals and a short behavioral segment.',
};

const JOB_ROLES = [
  'Software Development Engineer',
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Java Developer',
  'Python Developer',
];

const EXPERIENCE_LEVELS = {
  beginner: 'Student or fresher with up to 1 year of experience. Start gently and focus on fundamentals.',
  intermediate: '1 to 3 years of experience. Expect solid fundamentals and some practical depth.',
  advanced: '3 or more years of experience. Expect depth, trade-offs and ownership.',
};

const DIFFICULTIES = ['easy', 'medium', 'hard', 'adaptive'];
const DURATIONS = [15, 30, 45, 60];
const MODES = {
  realistic: 'Realistic: no feedback until the final report.',
  practice: 'Practice: brief feedback after each answer.',
};

// Sensible default question count per duration
const DEFAULT_QUESTIONS = { 15: 4, 30: 6, 45: 8, 60: 10 };

const INTERVIEW_TYPE_KEYS = Object.keys(INTERVIEW_TYPES);
const COMPANY_NAMES = Object.keys(COMPANIES);

const findCompany = (name) =>
  name ? COMPANY_NAMES.find((c) => c.toLowerCase() === String(name).trim().toLowerCase()) || null : null;

/** Options for the setup page. `readinessCompanies` are the ones with a readiness score. */
const getOptions = (readinessCompanies = []) => ({
  interviewTypes: INTERVIEW_TYPE_KEYS.map((key) => ({
    key,
    label: INTERVIEW_TYPES[key].label,
    usesLanguage: Boolean(INTERVIEW_TYPES[key].usesLanguage),
    requiresLanguage: Boolean(INTERVIEW_TYPES[key].requiresLanguage),
  })),
  companies: COMPANY_NAMES.map((name) => ({
    name,
    hasReadiness: readinessCompanies.includes(name),
  })),
  jobRoles: JOB_ROLES,
  experienceLevels: Object.keys(EXPERIENCE_LEVELS),
  difficulties: DIFFICULTIES,
  durations: DURATIONS,
  modes: Object.keys(MODES),
  defaultQuestions: DEFAULT_QUESTIONS,
});

module.exports = {
  INTERVIEW_TYPES,
  INTERVIEW_TYPE_KEYS,
  COMPANIES,
  COMPANY_NAMES,
  JOB_ROLES,
  EXPERIENCE_LEVELS,
  DIFFICULTIES,
  DURATIONS,
  MODES,
  DEFAULT_QUESTIONS,
  findCompany,
  getOptions,
};
