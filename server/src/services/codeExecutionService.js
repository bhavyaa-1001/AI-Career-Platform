import { getCodeExecutionProvider, isCodeExecutionConfigured } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

import { executeCode as executeWithJudge0 } from './judge0Service.js';
import { executeCode as executeWithOnlineCompiler } from './onlineCompilerService.js';

const normalizeOutput = (s) => (s || '').trim().replace(/\r\n/g, '\n').replace(/\s+$/, '');

const resolveExecutor = () => {
  const provider = getCodeExecutionProvider();
  if (!provider) {
    throw new ApiError(
      503,
      'Code execution is not configured. Set ONLINECOMPILER_API_KEY or run local Judge0 (npm run judge0:up).',
    );
  }
  return provider === 'onlinecompiler' ? executeWithOnlineCompiler : executeWithJudge0;
};

export { isCodeExecutionConfigured, getCodeExecutionProvider };

export const executeCode = async (params) => resolveExecutor()(params);

export const runTestCases = async ({ sourceCode, language, testCases, timeLimitMs, memoryLimitKb }) => {
  const run = resolveExecutor();
  const results = [];
  let maxTime = 0;
  let maxMemory = 0;
  let allPassed = true;
  let firstError = '';

  for (let i = 0; i < testCases.length; i += 1) {
    const tc = testCases[i];
    const exec = await run({
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
