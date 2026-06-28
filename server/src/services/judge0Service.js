import { JUDGE0_LANGUAGE_IDS } from '../config/codingConstants.js';
import { env, isJudge0Configured } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

const JUDGE0_STATUS = {
  1: 'in_queue', 2: 'processing', 3: 'accepted', 4: 'wrong_answer',
  5: 'time_limit_exceeded', 6: 'compilation_error', 7: 'runtime_error',
  8: 'runtime_error', 9: 'runtime_error', 10: 'runtime_error',
  11: 'runtime_error', 12: 'runtime_error', 13: 'internal_error',
  14: 'exec_format_error', 15: 'memory_limit_exceeded',
};

const buildHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (env.JUDGE0_RAPIDAPI_KEY) {
    headers['X-RapidAPI-Key'] = env.JUDGE0_RAPIDAPI_KEY;
    headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
  } else if (env.JUDGE0_AUTH_TOKEN) {
    headers['X-Auth-Token'] = env.JUDGE0_AUTH_TOKEN;
  }
  return headers;
};

const getBaseUrl = () => {
  if (env.JUDGE0_RAPIDAPI_KEY) return 'https://judge0-ce.p.rapidapi.com';
  return env.JUDGE0_API_URL.replace(/\/$/, '');
};

const normalizeOutput = (s) => (s || '').trim().replace(/\r\n/g, '\n').replace(/\s+$/, '');

export const executeCode = async ({
  sourceCode,
  language,
  stdin = '',
  timeLimitMs = 2000,
  memoryLimitKb = 262144,
}) => {
  if (!isJudge0Configured) {
    throw new ApiError(503, 'Code execution is not configured. Set JUDGE0_AUTH_TOKEN or JUDGE0_RAPIDAPI_KEY.');
  }

  const languageId = JUDGE0_LANGUAGE_IDS[language];
  if (!languageId) throw new ApiError(400, `Unsupported language: ${language}`);

  const url = `${getBaseUrl()}/submissions?base64_encoded=false&wait=true&fields=stdout,stderr,compile_output,status,time,memory,message`;

  const body = {
    source_code: sourceCode,
    language_id: languageId,
    stdin,
    cpu_time_limit: Math.max(1, Math.ceil(timeLimitMs / 1000)),
    memory_limit: memoryLimitKb,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.warn('Judge0 error', { status: response.status, errText });
      throw new ApiError(502, 'Code execution service unavailable');
    }

    const data = await response.json();
    const statusId = data.status?.id || 13;
    const statusKey = JUDGE0_STATUS[statusId] || 'internal_error';

    return {
      status: statusKey,
      stdout: data.stdout || '',
      stderr: data.stderr || '',
      compileOutput: data.compile_output || '',
      timeMs: Math.round(parseFloat(data.time || 0) * 1000),
      memoryKb: data.memory || 0,
      message: data.message || '',
      passed: statusId === 3 && normalizeOutput(data.stdout) !== '',
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error('Judge0 fetch failed', { error: err.message });
    throw new ApiError(502, 'Failed to execute code');
  }
};

export const runTestCases = async ({ sourceCode, language, testCases, timeLimitMs, memoryLimitKb }) => {
  const results = [];
  let maxTime = 0;
  let maxMemory = 0;
  let allPassed = true;
  let firstError = '';

  for (let i = 0; i < testCases.length; i += 1) {
    const tc = testCases[i];
    const exec = await executeCode({
      sourceCode,
      language,
      stdin: tc.input,
      timeLimitMs,
      memoryLimitKb,
    });

    maxTime = Math.max(maxTime, exec.timeMs);
    maxMemory = Math.max(maxMemory, exec.memoryKb);

    let passed = false;
    let error = '';

    if (exec.status === 'compilation_error') {
      error = exec.compileOutput || 'Compilation error';
      allPassed = false;
      if (!firstError) firstError = error;
    } else if (exec.status === 'runtime_error') {
      error = exec.stderr || exec.message || 'Runtime error';
      allPassed = false;
      if (!firstError) firstError = error;
    } else if (exec.status === 'time_limit_exceeded') {
      error = 'Time limit exceeded';
      allPassed = false;
      if (!firstError) firstError = error;
    } else if (exec.status === 'memory_limit_exceeded') {
      error = 'Memory limit exceeded';
      allPassed = false;
      if (!firstError) firstError = error;
    } else {
      passed = normalizeOutput(exec.stdout) === normalizeOutput(tc.output);
      if (!passed) {
        error = 'Wrong answer';
        allPassed = false;
        if (!firstError) firstError = 'Wrong answer';
      }
    }

    results.push({
      index: i,
      passed,
      input: tc.input,
      expectedOutput: tc.output,
      actualOutput: exec.stdout || '',
      error,
      timeMs: exec.timeMs,
      memoryKb: exec.memoryKb,
    });
  }

  let overallStatus = 'accepted';
  if (results.some((r) => r.error === 'Compilation error' || r.error?.includes('Compilation'))) {
    overallStatus = 'compilation_error';
  } else if (results.some((r) => r.error === 'Time limit exceeded')) {
    overallStatus = 'time_limit_exceeded';
  } else if (results.some((r) => r.error === 'Memory limit exceeded')) {
    overallStatus = 'memory_limit_exceeded';
  } else if (results.some((r) => r.error === 'Runtime error' || r.error?.includes('Runtime'))) {
    overallStatus = 'runtime_error';
  } else if (!allPassed) {
    overallStatus = 'wrong_answer';
  }

  return {
    status: overallStatus,
    passedCount: results.filter((r) => r.passed).length,
    totalCount: results.length,
    testResults: results,
    executionTimeMs: maxTime,
    memoryKb: maxMemory,
    compileOutput: results.find((r) => r.error?.includes('Compilation'))?.error || '',
    runtimeError: firstError,
  };
};
