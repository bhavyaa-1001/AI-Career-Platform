import { GoogleGenerativeAI } from '@google/generative-ai';

import { env, isGeminiConfigured } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

const FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'];

const MATCH_SCHEMA = `{
  "matchScore": number (0-100, overall resume-to-job fit),
  "summary": "2-3 sentence fit assessment",
  "matchedSkills": ["up to 12 skills from resume that match the job"],
  "missingSkills": [{ "skill": string, "priority": "low"|"medium"|"high", "reason": string }],
  "strengths": [{ "title": string, "detail": string }],
  "weaknesses": [{ "title": string, "detail": string }],
  "learningSuggestions": [{ "topic": string, "resource": string, "reason": string, "priority": "low"|"medium"|"high" }]
}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errorMessage = (err) => String(err?.message || err || '').toLowerCase();
const clamp = (n, min, max) => Math.min(max, Math.max(min, Math.round(Number(n) || 0)));

const isRetryable = (err) => {
  const msg = errorMessage(err);
  return msg.includes('429') || msg.includes('503') || msg.includes('quota') || msg.includes('not found') || msg.includes('unavailable');
};

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
    throw new ApiError(502, 'AI returned invalid match response');
  }
};

const buildPrompt = ({ resumeText, jobDescription, jobTitle, companyName }) => {
  const roleLine = jobTitle ? `Job title: ${jobTitle}` : '';
  const companyLine = companyName ? `Company: ${companyName}` : '';

  return `You are an expert career coach comparing a candidate resume against a job description.

${roleLine}
${companyLine}

Job description:
---
${jobDescription.slice(0, 5000)}
---

Candidate resume:
---
${resumeText.slice(0, 6000)}
---

Return ONLY valid JSON matching this schema (no markdown):
${MATCH_SCHEMA}

Rules:
- matchScore reflects how well the resume fits THIS specific job (not generic ATS quality).
- missingSkills: up to 10 skills required by the job but absent or weak in the resume.
- matchedSkills: skills clearly present in the resume that align with the job.
- strengths: up to 5 resume highlights relevant to this role.
- weaknesses: up to 5 gaps or areas to improve for this role.
- learningSuggestions: up to 6 actionable learning paths to close gaps.
- Be evidence-based — only cite what is in the resume or job description.`;
};

const normalize = (raw) => ({
  matchScore: clamp(raw.matchScore, 0, 100),
  summary: String(raw.summary || '').slice(0, 2000),
  matchedSkills: (raw.matchedSkills || []).slice(0, 15).map(String),
  missingSkills: (raw.missingSkills || []).slice(0, 10).map((s) => ({
    skill: String(s.skill || s).slice(0, 80),
    priority: ['low', 'medium', 'high'].includes(s.priority) ? s.priority : 'medium',
    reason: String(s.reason || '').slice(0, 300),
  })),
  strengths: (raw.strengths || []).slice(0, 5).map((s) => ({
    title: String(s.title || '').slice(0, 120),
    detail: String(s.detail || '').slice(0, 500),
  })),
  weaknesses: (raw.weaknesses || []).slice(0, 5).map((s) => ({
    title: String(s.title || '').slice(0, 120),
    detail: String(s.detail || '').slice(0, 500),
  })),
  learningSuggestions: (raw.learningSuggestions || []).slice(0, 6).map((s) => ({
    topic: String(s.topic || '').slice(0, 120),
    resource: String(s.resource || '').slice(0, 200),
    reason: String(s.reason || '').slice(0, 300),
    priority: ['low', 'medium', 'high'].includes(s.priority) ? s.priority : 'medium',
  })),
});

export const compareResumeToJob = async ({ resumeText, jobDescription, jobTitle, companyName }) => {
  if (!isGeminiConfigured) {
    throw new ApiError(503, 'AI is not configured. Set GEMINI_API_KEY.');
  }

  const prompt = buildPrompt({ resumeText, jobDescription, jobTitle, companyName });
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const started = Date.now();
  let lastError = null;

  for (const modelName of getModelsToTry()) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.35, responseMimeType: 'application/json' },
      });
      let result;
      try {
        result = await model.generateContent(prompt);
      } catch (err) {
        if (isRetryable(err)) {
          await sleep(3000);
          result = await model.generateContent(prompt);
        } else throw err;
      }
      const parsed = normalize(parseJsonResponse(result.response.text()));
      return {
        ...parsed,
        model: modelName,
        durationMs: Date.now() - started,
      };
    } catch (err) {
      lastError = err;
      logger.warn(`Resume match failed on ${modelName}: ${err.message}`);
      if (isRetryable(err)) continue;
      if (err instanceof ApiError) throw err;
    }
  }

  if (lastError instanceof ApiError) throw lastError;
  throw new ApiError(502, 'Resume comparison failed. Try again.');
};
