import { GoogleGenerativeAI } from '@google/generative-ai';

import { env, isGeminiConfigured } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

const FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'];

const REVIEW_SCHEMA = `{
  "summary": "brief overall assessment",
  "bugs": ["detected bugs or logic errors"],
  "optimizations": ["performance or readability improvements"],
  "namingSuggestions": ["better variable/function names"],
  "codeSmells": ["code smell descriptions"],
  "securityIssues": ["security concerns if any"],
  "bestPractices": ["recommended best practices"],
  "timeComplexity": "Big-O time complexity with explanation",
  "spaceComplexity": "Big-O space complexity with explanation",
  "alternativeSolutions": ["brief alternative approaches"]
}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errorMessage = (err) => String(err?.message || err || '').toLowerCase();

const getModelsToTry = () => {
  const chain = [env.GEMINI_MODEL, ...FALLBACK_MODELS.filter((m) => m !== env.GEMINI_MODEL)];
  return [...new Set(chain)];
};

const parseJsonResponse = (text) => {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new ApiError(502, 'AI returned invalid code review response');
  }
};

const normalizeReview = (raw) => ({
  summary: String(raw.summary || '').slice(0, 2000),
  bugs: (raw.bugs || []).slice(0, 10).map(String),
  optimizations: (raw.optimizations || []).slice(0, 10).map(String),
  namingSuggestions: (raw.namingSuggestions || []).slice(0, 10).map(String),
  codeSmells: (raw.codeSmells || []).slice(0, 10).map(String),
  securityIssues: (raw.securityIssues || []).slice(0, 10).map(String),
  bestPractices: (raw.bestPractices || []).slice(0, 10).map(String),
  timeComplexity: String(raw.timeComplexity || '').slice(0, 500),
  spaceComplexity: String(raw.spaceComplexity || '').slice(0, 500),
  alternativeSolutions: (raw.alternativeSolutions || []).slice(0, 5).map(String),
});

export const reviewCodeWithAI = async ({ sourceCode, language, problemTitle, problemDescription }) => {
  if (!isGeminiConfigured) throw new ApiError(503, 'AI code review requires GEMINI_API_KEY');

  const prompt = `You are a senior software engineer reviewing competitive programming / interview code.

Problem: ${problemTitle}
Description (truncated): ${(problemDescription || '').slice(0, 2000)}
Language: ${language}

Code:
\`\`\`${language}
${sourceCode.slice(0, 8000)}
\`\`\`

Analyze the code thoroughly. Return ONLY valid JSON matching this schema:
${REVIEW_SCHEMA}`;

  const start = Date.now();
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  let lastError;

  for (const modelName of getModelsToTry()) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = normalizeReview(parseJsonResponse(text));
      return { ...parsed, model: modelName, durationMs: Date.now() - start };
    } catch (err) {
      lastError = err;
      const msg = errorMessage(err);
      if (msg.includes('429') || msg.includes('503') || msg.includes('quota')) {
        await sleep(1500);
        continue;
      }
      logger.warn('Code review model failed', { model: modelName, error: err.message });
    }
  }

  throw new ApiError(502, lastError?.message || 'AI code review failed');
};

const HINT_PROMPTS = {
  1: 'Give Hint 1: a gentle nudge about the approach without revealing the algorithm. 2-3 sentences.',
  2: 'Give Hint 2: describe the algorithm category and key insight. Do NOT give code.',
  3: 'Give Hint 3: outline step-by-step approach with pseudocode structure but no full solution.',
  4: 'Give the full solution explanation with code in the requested language.',
};

export const generateHintWithAI = async ({
  level, problemTitle, problemDescription, language, previousHints = [],
}) => {
  if (!isGeminiConfigured) throw new ApiError(503, 'AI hints require GEMINI_API_KEY');
  if (level < 1 || level > 4) throw new ApiError(400, 'Hint level must be 1-4');

  const prevContext = previousHints.length
    ? `Previous hints given:\n${previousHints.map((h, i) => `${i + 1}. ${h}`).join('\n')}`
    : '';

  const prompt = `You are a coding tutor helping with this problem.

Problem: ${problemTitle}
Description: ${(problemDescription || '').slice(0, 3000)}
Language: ${language}

${prevContext}

${HINT_PROMPTS[level]}

Return ONLY JSON: { "content": "your hint text here" }`;

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  for (const modelName of getModelsToTry()) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(prompt);
      const parsed = parseJsonResponse(result.response.text());
      return { content: String(parsed.content || '').slice(0, 4000), model: modelName };
    } catch (err) {
      logger.warn('Hint generation failed', { model: modelName, level, error: err.message });
    }
  }
  throw new ApiError(502, 'AI hint generation failed');
};

export const generateDryRunWithAI = async ({ sourceCode, language, problemTitle, sampleInput }) => {
  if (!isGeminiConfigured) throw new ApiError(503, 'AI dry run requires GEMINI_API_KEY');

  const prompt = `Trace this code step-by-step with sample input.

Problem: ${problemTitle}
Sample Input: ${sampleInput || 'N/A'}
Language: ${language}

Code:
\`\`\`${language}
${sourceCode.slice(0, 6000)}
\`\`\`

Return ONLY JSON: { "content": "detailed dry run trace showing variable values at each step" }`;

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  for (const modelName of getModelsToTry()) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(prompt);
      const parsed = parseJsonResponse(result.response.text());
      return { content: String(parsed.content || '').slice(0, 5000), model: modelName };
    } catch (err) {
      logger.warn('Dry run failed', { model: modelName, error: err.message });
    }
  }
  throw new ApiError(502, 'AI dry run failed');
};

export const generateVisualExplanationWithAI = async ({ problemTitle, problemDescription }) => {
  if (!isGeminiConfigured) throw new ApiError(503, 'AI visual explanation requires GEMINI_API_KEY');

  const prompt = `Explain this coding problem visually using ASCII diagrams and structured markdown.

Problem: ${problemTitle}
Description: ${(problemDescription || '').slice(0, 3000)}

Return ONLY JSON: { "content": "visual explanation with ASCII art, examples, and step illustrations" }`;

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  for (const modelName of getModelsToTry()) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.5, responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(prompt);
      const parsed = parseJsonResponse(result.response.text());
      return { content: String(parsed.content || '').slice(0, 5000), model: modelName };
    } catch (err) {
      logger.warn('Visual explanation failed', { model: modelName, error: err.message });
    }
  }
  throw new ApiError(502, 'AI visual explanation failed');
};
