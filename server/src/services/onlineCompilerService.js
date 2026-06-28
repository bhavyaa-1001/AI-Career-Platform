import { ONLINE_COMPILER_LANGUAGE_IDS } from '../config/codingConstants.js';
import { env, isOnlineCompilerConfigured } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

const mapOnlineCompilerStatus = (data) => {
  const exitCode = data.exit_code ?? 1;
  const stderr = data.error || '';

  if (exitCode === 0 && data.status === 'success') return 'accepted';
  if (exitCode === 124) return 'time_limit_exceeded';
  if (exitCode === 137) return 'memory_limit_exceeded';

  if (
    stderr
    && (/error:|fatal error:|cannot find symbol|undefined reference|syntax error|compilation/i.test(stderr)
      || (stderr.trim() && !data.output))
  ) {
    return 'compilation_error';
  }

  return 'runtime_error';
};

export const executeCode = async ({ sourceCode, language, stdin = '' }) => {
  if (!isOnlineCompilerConfigured) {
    throw new ApiError(503, 'OnlineCompiler API key not configured. Set ONLINECOMPILER_API_KEY in server/.env');
  }

  const compiler = ONLINE_COMPILER_LANGUAGE_IDS[language];
  if (!compiler) throw new ApiError(400, `Unsupported language: ${language}`);

  const url = `${env.ONLINECOMPILER_API_URL.replace(/\/$/, '')}/api/run-code-sync/`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: env.ONLINECOMPILER_API_KEY,
      },
      body: JSON.stringify({
        compiler,
        code: sourceCode,
        input: stdin,
      }),
    });

    if (response.status === 429) {
      throw new ApiError(503, 'Code execution rate limit reached. Wait a moment and try again.');
    }

    if (!response.ok) {
      const errText = await response.text();
      logger.warn('OnlineCompiler error', { status: response.status, errText });
      throw new ApiError(502, 'Code execution service unavailable');
    }

    const data = await response.json();
    const status = mapOnlineCompilerStatus(data);
    const isCompileError = status === 'compilation_error';

    return {
      status,
      stdout: data.output || '',
      stderr: isCompileError ? '' : data.error || '',
      compileOutput: isCompileError ? data.error || '' : '',
      timeMs: Math.round(parseFloat(data.time || data.total || 0) * 1000),
      memoryKb: parseInt(data.memory, 10) || 0,
      message: data.error || '',
      passed: status === 'accepted',
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error('OnlineCompiler fetch failed', { error: err.message });
    throw new ApiError(502, 'Failed to execute code');
  }
};
