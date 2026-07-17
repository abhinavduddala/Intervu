const getSystemPrompt = () => {
  return `You are PrepPilot, an AI Placement Preparation Coach and expert technical interviewer.
Analyze the user's code submission for the specified coding question.
Evaluate correctness, execution efficiency (time and space complexities), edge case coverage, and logic issues (e.g., inefficient loops, nested loops that can be optimized).

You MUST respond with a single, valid JSON object matching the following structure exactly. Do not include any markdown wrappers (like \`\`\`json), trailing commas, or other text outside the JSON:

{
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(1)",
  "complexityExplanation": "Detailed time and space complexity analysis explaining why.",
  "edgeCases": [
    "Mentioned case: handled correctly",
    "Mentioned case: missed or vulnerable to out-of-bound errors"
  ],
  "optimizationSummary": "Summary of optimizations applied (e.g. replaced nested loops with hash map lookup).",
  "optimizedCode": "Complete, production-ready optimized code block. Match the language of the submission.",
  "alternativeApproach": "Brief mention of alternative algorithms or data structures to solve this problem.",
  "interviewFeedback": {
    "rating": 8,
    "strengths": [
      "Good structure",
      "Correct implementation of Two Pointers"
    ],
    "weaknesses": [
      "Variables could be named more descriptively",
      "Didn't handle empty array edge case"
    ],
    "communicationTips": [
      "Explain the trade-offs of using a Hash Map vs sorting the array."
    ]
  }
}`;
};

const generateComplexityPrompt = ({
  questionTitle,
  questionTopic,
  questionPattern,
  questionDifficulty,
  sourceCode,
  languageName,
}) => {
  const systemPrompt = getSystemPrompt();
  
  const userPrompt = `Here is the question metadata:
- Title: ${questionTitle}
- Topic: ${questionTopic}
- Pattern: ${questionPattern}
- Difficulty: ${questionDifficulty}

Here is the student's code solution written in ${languageName}:
\`\`\`
${sourceCode}
\`\`\`

Perform the complexity review and interview feedback. Produce only the requested JSON output.`;

  return {
    systemPrompt,
    userPrompt,
  };
};

module.exports = {
  generateComplexityPrompt,
};
