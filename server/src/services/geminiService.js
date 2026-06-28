import { GoogleGenerativeAI } from '@google/generative-ai';

import { env, isGeminiConfigured } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

const PROMPT_VERSION = 'v2';
const MAX_TEXT_LENGTH = 8000;

const DEPRECATED_MODELS = new Set([
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite-001',
  'gemini-1.5-flash',
  'gemini-1.5-flash-001',
  'gemini-1.5-flash-002',
  'gemini-1.5-pro',
]);

const FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'];

const ANALYSIS_SCHEMA = `{
  "atsScore": number (0-100),
  "grammar": { "score": number (0-100), "issues": [{ "text": string, "suggestion": string, "severity": "low"|"medium"|"high" }] },
  "missingSkills": [string],
  "weakBulletPoints": [{ "original": string, "suggestion": string, "section": string }],
  "keywordSuggestions": [{ "keyword": string, "reason": string, "priority": "low"|"medium"|"high" }],
  "resumeSummary": string,
  "improvementTips": [{ "category": string, "tip": string, "priority": "low"|"medium"|"high" }]
}`;

const buildPrompt = ({ resumeText, targetRole, targetJobDescription }) => {
  const roleContext = targetRole ? `Target role: ${targetRole}` : 'Target role: not specified';
  const jdContext = targetJobDescription
    ? `\nJob description:\n${targetJobDescription.slice(0, 2000)}`
    : '';

  return `Expert ATS resume coach. Return ONLY valid JSON matching this schema (no markdown):

${ANALYSIS_SCHEMA}

Rules: atsScore (ATS readiness), grammar.score + up to 5 issues, up to 8 missingSkills, up to 5 weakBulletPoints with rewrites, up to 8 keywordSuggestions, resumeSummary (2-3 sentences), up to 6 improvementTips.

${roleContext}${jdContext}

Resume:
---
${resumeText}
---`;
};

const parseJsonResponse = (text) => {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!cleaned) {
    throw new ApiError(502, 'AI returned an empty response.');
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        /* fall through */
      }
    }
    throw new ApiError(502, 'AI returned an invalid JSON response.');
  }
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeAnalysis = (raw) => ({
  atsScore: clamp(Number(raw.atsScore) || 0, 0, 100),
  grammar: {
    score: clamp(Number(raw.grammar?.score) || 0, 0, 100),
    issues: (raw.grammar?.issues || []).slice(0, 8).map((issue) => ({
      text: String(issue.text || '').slice(0, 500),
      suggestion: String(issue.suggestion || '').slice(0, 500),
      severity: ['low', 'medium', 'high'].includes(issue.severity) ? issue.severity : 'medium',
    })),
  },
  missingSkills: (raw.missingSkills || []).slice(0, 10).map((s) => String(s).slice(0, 80)),
  weakBulletPoints: (raw.weakBulletPoints || []).slice(0, 8).map((b) => ({
    original: String(b.original || '').slice(0, 500),
    suggestion: String(b.suggestion || '').slice(0, 500),
    section: String(b.section || 'experience').slice(0, 50),
  })),
  keywordSuggestions: (raw.keywordSuggestions || []).slice(0, 10).map((k) => ({
    keyword: String(k.keyword || '').slice(0, 80),
    reason: String(k.reason || '').slice(0, 300),
    priority: ['low', 'medium', 'high'].includes(k.priority) ? k.priority : 'medium',
  })),
  resumeSummary: String(raw.resumeSummary || '').slice(0, 3000),
  improvementTips: (raw.improvementTips || []).slice(0, 8).map((t) => ({
    category: String(t.category || 'general').slice(0, 50),
    tip: String(t.tip || '').slice(0, 500),
    priority: ['low', 'medium', 'high'].includes(t.priority) ? t.priority : 'medium',
  })),
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const errorMessage = (err) => String(err?.message || err || '').toLowerCase();

const isRateLimitError = (err) => {
  const msg = errorMessage(err);
  return msg.includes('429') || msg.includes('too many requests') || msg.includes('quota') || msg.includes('rate limit');
};

const isModelNotFoundError = (err) => {
  const msg = errorMessage(err);
  return msg.includes('404') || msg.includes('not found') || msg.includes('is not found') || msg.includes('not supported');
};

const isServiceUnavailableError = (err) => {
  const msg = errorMessage(err);
  return msg.includes('503') || msg.includes('unavailable') || msg.includes('high demand') || msg.includes('overloaded');
};

const isRetryableError = (err) => {
  if (isModelNotFoundError(err) || isRateLimitError(err) || isServiceUnavailableError(err)) return true;
  if (err instanceof ApiError && err.statusCode === 502) return true;
  const msg = errorMessage(err);
  return (
    msg.includes('blocked')
    || msg.includes('candidate')
    || msg.includes('empty response')
    || msg.includes('invalid json')
    || msg.includes('fetch failed')
    || msg.includes('network')
    || msg.includes('econnreset')
    || msg.includes('timeout')
  );
};

const getRetryDelayMs = (err) => {
  const msg = String(err?.message || '');
  const retryIn = msg.match(/retry in ([\d.]+)s/i);
  if (retryIn) return Math.min(Math.ceil(Number(retryIn[1]) * 1000) + 500, 65000);
  const retryDelay = msg.match(/retryDelay["']:\s*"?(\d+)s/i);
  if (retryDelay) return Math.min(Number(retryDelay[1]) * 1000 + 500, 65000);
  return 60000;
};

const sanitizeErrorHint = (msg) => msg.replace(/\[GoogleGenerativeAI Error\]:?\s*/gi, '').slice(0, 180);

const mapGeminiError = (err, triedModels = []) => {
  if (err instanceof ApiError) return err;

  const msg = String(err?.message || err || 'Unknown error');
  const hint = sanitizeErrorHint(msg);

  if (isRateLimitError(err)) {
    const seconds = Math.ceil(getRetryDelayMs(err) / 1000);
    return new ApiError(
      429,
      `Gemini rate limit reached. Wait about ${seconds} seconds and try again.`,
    );
  }

  if (isServiceUnavailableError(err)) {
    return new ApiError(503, 'Gemini is temporarily busy. Wait a moment and try again.');
  }

  if (msg.includes('403') || msg.toLowerCase().includes('api key')) {
    return new ApiError(403, 'Invalid Gemini API key. Check GEMINI_API_KEY in your server .env file.');
  }

  if (isModelNotFoundError(err)) {
    const modelsHint = triedModels.length ? ` Tried: ${triedModels.join(', ')}.` : '';
    return new ApiError(
      502,
      `No Gemini model available.${modelsHint} Set GEMINI_MODEL=gemini-2.5-flash-lite in server .env and restart.`,
    );
  }

  if (msg.toLowerCase().includes('blocked') || msg.toLowerCase().includes('safety')) {
    return new ApiError(502, 'AI blocked the response. Try again or upload a simpler resume file.');
  }

  return new ApiError(502, hint || 'AI analysis failed. Please try again.');
};

const getModelsToTry = () => {
  let primary = env.GEMINI_MODEL;
  if (DEPRECATED_MODELS.has(primary)) {
    primary = 'gemini-2.5-flash-lite';
  }
  const chain = [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)];
  return [...new Set(chain)];
};

const extractResponseText = (result) => {
  const response = result?.response;
  if (!response) throw new ApiError(502, 'AI returned no response object.');

  const candidate = response.candidates?.[0];
  if (!candidate) {
    const blockReason = response.promptFeedback?.blockReason;
    if (blockReason) {
      throw new ApiError(502, `AI blocked the request (${blockReason}). Try a different resume file.`);
    }
    throw new ApiError(502, 'AI returned no candidates. Try again.');
  }

  const finishReason = candidate.finishReason;
  if (finishReason && !['STOP', 'MAX_TOKENS'].includes(finishReason)) {
    throw new ApiError(502, `AI stopped early (${finishReason}). Try again or shorten the resume.`);
  }

  const parts = candidate.content?.parts || [];
  const text = parts.map((p) => p.text || '').join('').trim();
  if (text) return text;

  try {
    return response.text();
  } catch (err) {
    throw new ApiError(502, `Could not read AI response: ${sanitizeErrorHint(err.message)}`);
  }
};

const generateWithModel = async (genAI, modelName, prompt, useJsonMode = true) => {
  const generationConfig = { temperature: 0.3 };
  if (useJsonMode) {
    generationConfig.responseMimeType = 'application/json';
  }

  const model = genAI.getGenerativeModel({ model: modelName, generationConfig });
  return model.generateContent(prompt);
};

const useJsonModeSupported = (err) => {
  const msg = errorMessage(err);
  return msg.includes('responsemimetype') || msg.includes('json') || msg.includes('not supported');
};

const runModelAttempt = async (genAI, modelName, prompt) => {
  try {
    const result = await generateWithModel(genAI, modelName, prompt, true);
    return extractResponseText(result);
  } catch (err) {
    if (useJsonModeSupported(err)) {
      const result = await generateWithModel(genAI, modelName, prompt, false);
      return extractResponseText(result);
    }
    throw err;
  }
};

export const analyzeResumeText = async ({ resumeText, targetRole, targetJobDescription }) => {
  if (!isGeminiConfigured) {
    throw new ApiError(503, 'AI analysis is not configured. Set GEMINI_API_KEY in server environment.');
  }

  const text = String(resumeText || '').trim();
  if (text.length < 50) {
    throw new ApiError(422, 'Not enough resume text to analyze. Upload a longer resume or add more content.');
  }

  const truncated = text.slice(0, MAX_TEXT_LENGTH);
  const prompt = buildPrompt({ resumeText: truncated, targetRole, targetJobDescription });
  const start = Date.now();
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const models = getModelsToTry();

  let lastError = null;
  const triedModels = [];
  const errors = [];

  for (const modelName of models) {
    triedModels.push(modelName);
    try {
      let responseText;
      try {
        responseText = await runModelAttempt(genAI, modelName, prompt);
      } catch (err) {
        if (isRateLimitError(err) || isServiceUnavailableError(err)) {
          const delay = isRateLimitError(err) ? getRetryDelayMs(err) : 3000;
          if (delay <= 65000) {
            await sleep(delay);
            responseText = await runModelAttempt(genAI, modelName, prompt);
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }

      const parsed = parseJsonResponse(responseText);
      const analysis = normalizeAnalysis(parsed);

      return {
        ...analysis,
        model: modelName,
        promptVersion: PROMPT_VERSION,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      lastError = err;
      const label = err instanceof ApiError ? err.message : err.message;
      errors.push(`${modelName}: ${sanitizeErrorHint(label)}`);
      logger.warn(`Gemini analysis failed for ${modelName}: ${label}`);

      if (isRetryableError(err)) continue;
      throw mapGeminiError(err, triedModels);
    }
  }

  logger.error(`All Gemini models failed. ${errors.join(' | ')}`);
  throw mapGeminiError(lastError, triedModels);
};
