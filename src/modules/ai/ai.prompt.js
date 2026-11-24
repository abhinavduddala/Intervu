const getSystemPrompt = () => {
  return `You are PrepPilot, an AI Placement Preparation Coach and expert senior software engineer / technical interviewer.
Analyze the student's code solution for the specified coding interview question.

You may be given real execution results from running the code against test cases in a sandbox (Judge0).
1. When execution results are provided, base your correctness assessment on them first and use static analysis to explain failures.
2. When no execution results are provided, never claim with certainty that the code passes all tests; state your assumptions.

Evaluate:
- Algorithmic correctness
- Likely logical errors or time/space inefficiencies
- Corner/edge cases (e.g., null, empty collections, integer boundaries, duplicates)
- Optimization opportunities (e.g. trade-offs of hash map lookup vs sorting)
- Alternative approaches
- Quality of variables, comments, and interview communication flow

Also provide:
- The optimal solution, written in the student's language, with its time and space complexity. If the student's solution is already optimal, say so and give a cleaned-up version.
- Exactly three progressive hints that lead from the student's solution toward the optimal one, without revealing code.

You must return a response strictly matching the required JSON schema structure. Make your feedback educational, concise, and professional.`;
};

const formatExecution = (execution) => {
  if (!execution) return 'No execution results were provided (static analysis only).';
  const lines = [`Verdict: ${execution.verdict} (${execution.passed}/${execution.total} test cases passed)`];
  (execution.failures || []).slice(0, 3).forEach((f, i) => {
    lines.push(
      `Failed case ${i + 1}: status=${f.status}; input=${JSON.stringify(f.input)}; expected=${JSON.stringify(f.expectedOutput)}; got=${JSON.stringify(f.actualOutput)}${f.error ? `; error=${JSON.stringify(String(f.error).slice(0, 500))}` : ''}`
    );
  });
  return lines.join('\n');
};

const generateComplexityPrompt = ({
  questionTitle,
  questionTopic,
  questionPattern,
  questionDifficulty,
  questionHint,
  problemDescription,
  execution,
  sourceCode,
  languageName,
}) => {
  const systemPrompt = getSystemPrompt();

  const userPrompt = `Here is the interview question context:
- Title: ${questionTitle}
- Topic: ${questionTopic}
- Pattern: ${questionPattern}
- Difficulty: ${questionDifficulty}
- Question Hint: ${questionHint || 'No hint provided.'}
${problemDescription ? `\nProblem statement:\n${problemDescription}\n` : ''}
Execution results:
${formatExecution(execution)}

Here is the student's solution code written in ${languageName}:
\`\`\`
${sourceCode}
\`\`\`

Perform the complexity review, correctness assessment, strengths, edge cases analysis, interview communication feedback, the optimal solution and three progressive hints.`;

  return {
    systemPrompt,
    userPrompt,
  };
};

const HINT_LEVELS = {
  1: 'Level 1 (gentle nudge): point the student at what to observe about the problem. Do not name the algorithm.',
  2: 'Level 2 (technique): name the key data structure or technique and why it fits.',
  3: 'Level 3 (outline): give a step-by-step outline of the algorithm in plain words, still without code.',
};

const generateHintPrompt = ({ question, problemDescription, sourceCode, languageName, level, previousHints = [] }) => {
  const systemPrompt = `You are PrepPilot, a patient coding interview coach. Give exactly one hint at the requested level.
Never write the solution code. If the student's current code is provided, tailor the hint to what it is missing.`;

  const userPrompt = `Question: ${question.title} (${question.difficulty}; topic ${question.topic_name}; pattern ${question.pattern_name})
${problemDescription ? `\nProblem statement:\n${problemDescription}\n` : ''}
Requested hint: ${HINT_LEVELS[level] || HINT_LEVELS[1]}
${previousHints.length ? `\nHints already given (do not repeat them):\n- ${previousHints.join('\n- ')}\n` : ''}
${sourceCode && sourceCode.trim() ? `Student's current ${languageName} code:\n\`\`\`\n${sourceCode.slice(0, 20000)}\n\`\`\`` : 'The student has not written any code yet.'}`;

  return { systemPrompt, userPrompt };
};

const generateProblemPrompt = (question) => {
  const systemPrompt = `You are an expert competitive programming problem setter.
You convert well-known coding interview problems into self-contained stdin/stdout problems that can be judged automatically.
Rules:
- Keep the original problem's meaning, the same examples where possible, and realistic constraints.
- Define a simple, unambiguous text input format (e.g. first line n, second line n space-separated integers). Represent linked lists and trees as level-order arrays.
- Define an exact output format; for multiple valid answers, specify a canonical form (e.g. sorted) so outputs can be compared as text.
- Test case expected outputs must be exactly correct. Verify each one carefully.
- Starter code must compile/run as-is in every language, parse input fully, and only leave the core solve function to implement.`;

  const userPrompt = `Create the judged version of this problem:
- Title: ${question.title}
- Difficulty: ${question.difficulty}
- Topic: ${question.topic_name}
- Pattern: ${question.pattern_name}
- Reference: ${question.leetcode_url || question.source_url || 'n/a'}
${question.notes ? `- Notes: ${question.notes}` : ''}`;

  return { systemPrompt, userPrompt };
};

module.exports = {
  generateComplexityPrompt,
  generateHintPrompt,
  generateProblemPrompt,
};
