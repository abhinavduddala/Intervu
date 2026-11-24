const analyzeResponseSchema = {
  type: "object",
  properties: {
    summary: { 
      type: "string",
      description: "A concise executive summary of the code and approach review."
    },
    correctnessAssessment: {
      type: "object",
      properties: {
        status: { 
          type: "string", 
          enum: ["likely_correct", "needs_review", "likely_incorrect"],
          description: "Assess correctness: likely_correct (clean, logical), needs_review (minor bugs/edge case issues), or likely_incorrect (fails logic)."
        },
        explanation: { 
          type: "string",
          description: "Explain why this correctness assessment status was assigned."
        }
      },
      required: ["status", "explanation"],
      additionalProperties: false
    },
    timeComplexity: {
      type: "object",
      properties: {
        value: { 
          type: "string",
          description: "Big O complexity notation like O(N), O(N log N), O(1)."
        },
        explanation: { 
          type: "string",
          description: "Reasoning and derivation steps for this time complexity value."
        }
      },
      required: ["value", "explanation"],
      additionalProperties: false
    },
    spaceComplexity: {
      type: "object",
      properties: {
        value: { 
          type: "string",
          description: "Big O space complexity notation like O(N), O(1)."
        },
        explanation: { 
          type: "string",
          description: "Reasoning and derivation steps for this space complexity value."
        }
      },
      required: ["value", "explanation"],
      additionalProperties: false
    },
    strengths: {
      type: "array",
      items: { type: "string" },
      description: "List of positives: naming, syntax choices, optimal design patterns, readability."
    },
    optimizations: {
      type: "array",
      items: { type: "string" },
      description: "Specific items of the code that can be optimized."
    },
    edgeCases: {
      type: "array",
      items: { type: "string" },
      description: "Missed or handled edge cases (like overflow, negative values, null/empty collections)."
    },
    alternativeApproach: { 
      type: "string",
      description: "Mention alternative designs (e.g. sorting first, using a tree, two-pointers vs hash map)."
    },
    interviewFeedback: { 
      type: "string",
      description: "Constructive feedback as if from a technical interviewer, focusing on communication and technical choices."
    },
    conceptsUsed: {
      type: "array",
      items: { type: "string" },
      description: "Key programming/CS concepts used in the solution, e.g. Hash Map, DFS, Sliding Window."
    },
    confidenceScore: { 
      type: "integer",
      description: "A confidence score between 0 and 100 on the overall quality and likely accuracy."
    },
    optimalSolution: {
      type: "object",
      description: "The best known solution for this problem, written in the same language as the student's code.",
      properties: {
        isUserSolutionOptimal: {
          type: "boolean",
          description: "True if the student's solution already matches the optimal time and space complexity."
        },
        approach: { type: "string", description: "Name and short description of the optimal approach." },
        explanation: { type: "string", description: "Step-by-step explanation of why the approach works." },
        timeComplexity: { type: "string", description: "Big O time complexity of the optimal solution." },
        spaceComplexity: { type: "string", description: "Big O space complexity of the optimal solution." },
        code: {
          type: "string",
          description: "Complete, runnable optimal solution in the student's language, keeping the same input/output handling as the student's program."
        }
      },
      required: ["isUserSolutionOptimal", "approach", "explanation", "timeComplexity", "spaceComplexity", "code"],
      additionalProperties: false
    },
    hints: {
      type: "array",
      items: { type: "string" },
      description: "Exactly three progressive hints that would lead the student from their solution toward the optimal one: 1) gentle nudge, 2) key data structure or technique, 3) outline of the algorithm. Never include full code."
    }
  },
  required: [
    "summary",
    "correctnessAssessment",
    "timeComplexity",
    "spaceComplexity",
    "strengths",
    "optimizations",
    "edgeCases",
    "alternativeApproach",
    "interviewFeedback",
    "conceptsUsed",
    "confidenceScore",
    "optimalSolution",
    "hints"
  ],
  additionalProperties: false
};

const hintResponseSchema = {
  type: "object",
  properties: {
    hint: { type: "string", description: "A single hint at the requested level. Never include the full solution code." },
    focus: { type: "string", description: "One short phrase naming the concept the hint points to." }
  },
  required: ["hint", "focus"],
};

const STARTER_LANGUAGES = ["python", "java", "cpp", "c", "javascript", "go", "csharp"];

const problemContentSchema = {
  type: "object",
  properties: {
    description: { type: "string", description: "Full problem statement in plain text (paragraphs separated by blank lines)." },
    inputFormat: { type: "string", description: "Exact stdin format the program receives." },
    outputFormat: { type: "string", description: "Exact stdout format the program must print." },
    constraints: { type: "array", items: { type: "string" } },
    examples: {
      type: "array",
      items: {
        type: "object",
        properties: {
          input: { type: "string", description: "Raw stdin for this example." },
          output: { type: "string", description: "Exact expected stdout." },
          explanation: { type: "string" }
        },
        required: ["input", "output", "explanation"]
      }
    },
    testCases: {
      type: "array",
      description: "8 test cases including the examples, edge cases and a few larger inputs. Expected outputs must be exactly correct.",
      items: {
        type: "object",
        properties: {
          input: { type: "string", description: "Raw stdin." },
          expectedOutput: { type: "string", description: "Exact expected stdout." },
          hidden: { type: "boolean", description: "False for the first 3 (shown to the user), true for the rest." }
        },
        required: ["input", "expectedOutput", "hidden"]
      }
    },
    referenceSolution: {
      type: "string",
      description: "A complete, correct Python 3 program that reads stdin in the documented format and prints the expected output. Used to verify the test cases; never shown to the user."
    },
    starterCode: {
      type: "object",
      description: "Starter program per language. Each must fully read and parse stdin in the documented format, call an empty solve function (with a TODO comment and a placeholder return), and print the result in the documented output format. Java must use `public class Main`.",
      properties: Object.fromEntries(STARTER_LANGUAGES.map((l) => [l, { type: "string" }])),
      required: STARTER_LANGUAGES
    }
  },
  required: ["description", "inputFormat", "outputFormat", "constraints", "examples", "testCases", "referenceSolution", "starterCode"],
};

module.exports = {
  analyzeResponseSchema,
  hintResponseSchema,
  problemContentSchema,
};
