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
    "confidenceScore"
  ],
  additionalProperties: false
};

module.exports = {
  analyzeResponseSchema
};
