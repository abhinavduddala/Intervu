/**
 * Output comparison and verdict helpers for judging test cases.
 */

// Judge0 status ids: 3 Accepted, 4 Wrong Answer, 5 TLE, 6 Compilation Error,
// 7-12 Runtime errors, 13 Internal Error, 14 Exec Format Error.
const STATUS = {
  ACCEPTED: { id: 3, description: 'Accepted' },
  WRONG_ANSWER: { id: 4, description: 'Wrong Answer' },
  TIME_LIMIT: { id: 5, description: 'Time Limit Exceeded' },
  COMPILATION_ERROR: { id: 6, description: 'Compilation Error' },
  RUNTIME_ERROR: { id: 11, description: 'Runtime Error' },
  INTERNAL_ERROR: { id: 13, description: 'Internal Error' },
};

const isNumber = (t) => t !== '' && !Number.isNaN(Number(t));

const tokensEqual = (a, b) => {
  if (a === b) return true;
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  if ((la === 'true' || la === 'false') && la === lb) return true;
  if (isNumber(a) && isNumber(b)) return Math.abs(Number(a) - Number(b)) <= 1e-6;
  // Treat [1, 2] and [1,2] style differences as equal
  return la.replace(/\s+/g, '') === lb.replace(/\s+/g, '');
};

/**
 * Whitespace-insensitive, token-by-token comparison of program output.
 */
const outputsMatch = (actual, expected) => {
  const norm = (s) => String(s ?? '').replace(/\r\n/g, '\n').trim();
  const a = norm(actual);
  const e = norm(expected);
  if (a === e) return true;
  const ta = a.split(/\s+/).filter(Boolean);
  const te = e.split(/\s+/).filter(Boolean);
  if (ta.length !== te.length) {
    return tokensEqual(a, e);
  }
  return ta.every((tok, i) => tokensEqual(tok, te[i]));
};

/**
 * Combine Judge0 results with test cases into per-case results and an overall verdict.
 * @param {Array<{input: string, expectedOutput?: string, hidden?: boolean}>} tests
 * @param {Array<object>} results Judge0 results in the same order.
 */
const evaluate = (tests, results) => {
  const cases = tests.map((test, i) => {
    const r = results[i] || {};
    const ranOk = r.statusId === 3;
    const hasExpected = test.expectedOutput !== undefined && test.expectedOutput !== null;
    const passed = ranOk && (!hasExpected || outputsMatch(r.stdout, test.expectedOutput));
    let status = r.statusDescription || 'Unknown';
    if (ranOk && hasExpected && !passed) status = STATUS.WRONG_ANSWER.description;
    return {
      index: i,
      hidden: Boolean(test.hidden),
      input: test.hidden ? null : test.input,
      expectedOutput: test.hidden ? null : (test.expectedOutput ?? null),
      actualOutput: test.hidden ? null : (r.stdout ?? ''),
      passed,
      status,
      statusId: r.statusId ?? null,
      stderr: r.stderr || null,
      compileOutput: r.compileOutput || null,
      message: r.message || null,
      executionTime: r.executionTime ?? null,
      executionMemory: r.executionMemory ?? null,
    };
  });

  const passedCount = cases.filter((c) => c.passed).length;
  const total = cases.length;
  const firstFailure = cases.find((c) => !c.passed);
  const firstRaw = firstFailure ? results[firstFailure.index] || {} : null;

  let verdict = STATUS.ACCEPTED;
  if (firstFailure) {
    const sid = firstRaw.statusId;
    if (sid === 6) verdict = STATUS.COMPILATION_ERROR;
    else if (sid === 5) verdict = STATUS.TIME_LIMIT;
    else if (sid >= 7 && sid <= 12) verdict = { id: sid, description: firstRaw.statusDescription || STATUS.RUNTIME_ERROR.description };
    else if (sid === 13 || sid === 14) verdict = STATUS.INTERNAL_ERROR;
    else verdict = STATUS.WRONG_ANSWER;
  }

  const times = cases.map((c) => c.executionTime).filter((t) => t !== null);
  const mems = cases.map((c) => c.executionMemory).filter((m) => m !== null);

  return {
    verdict: verdict.description,
    statusId: verdict.id,
    passed: passedCount,
    total,
    cases,
    executionTime: times.length ? Math.max(...times) : null,
    executionMemory: mems.length ? Math.max(...mems) : null,
    compileOutput: firstRaw?.compileOutput || null,
    stderr: firstRaw?.stderr || null,
    // Full details (including hidden inputs) of failures, kept server-side for AI analysis
    failures: cases
      .filter((c) => !c.passed)
      .map((c) => ({
        status: c.status,
        input: tests[c.index].input,
        expectedOutput: tests[c.index].expectedOutput,
        actualOutput: results[c.index]?.stdout ?? '',
        error: results[c.index]?.compileOutput || results[c.index]?.stderr || results[c.index]?.message || null,
      })),
  };
};

module.exports = {
  STATUS,
  outputsMatch,
  evaluate,
};
