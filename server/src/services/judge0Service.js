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
    throw new ApiError(
      503,
      'Judge0 is not configured. Set JUDGE0_AUTH_TOKEN, JUDGE0_RAPIDAPI_KEY, or run local Judge0.',
    );
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
