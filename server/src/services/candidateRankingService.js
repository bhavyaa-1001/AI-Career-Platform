import { GoogleGenerativeAI } from '@google/generative-ai';

import { env, isGeminiConfigured } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

const FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errorMessage = (err) => String(err?.message || err || '').toLowerCase();

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
    throw new ApiError(502, 'AI returned invalid ranking response');
  }
};

const clamp = (n) => Math.min(100, Math.max(0, Math.round(Number(n) || 0)));

const buildPrompt = ({ resumeText, jobTitle, jobDescription, requirements, coverLetter }) => `
You are an expert recruiter evaluating a candidate for a job opening.

Job title: ${jobTitle}

Job description:
${jobDescription.slice(0, 3000)}

Requirements:
${(requirements || '').slice(0, 1500)}

${coverLetter ? `Cover letter:\n${coverLetter.slice(0, 1500)}\n` : ''}

Candidate resume:
${resumeText.slice(0, 6000)}

Return ONLY valid JSON:
{
  "score": number (0-100, overall fit),
  "summary": "1-2 sentence fit assessment",
  "strengths": ["up to 4 matching strengths"],
  "gaps": ["up to 4 gaps or missing qualifications"]
}

Score guide: 90+ excellent fit, 70-89 strong, 50-69 moderate, below 50 weak fit.
Be fair — only score based on resume evidence, not assumptions.`;

export const rankCandidate = async ({ resumeText, jobTitle, jobDescription, requirements, coverLetter }) => {
  if (!isGeminiConfigured) {
    return {
      score: null,
      summary: 'AI ranking unavailable — configure GEMINI_API_KEY',
      strengths: [],
      gaps: [],
      model: null,
    };
  }

  const prompt = buildPrompt({ resumeText, jobTitle, jobDescription, requirements, coverLetter });
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  let lastError = null;

  for (const modelName of getModelsToTry()) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
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
      const parsed = parseJsonResponse(result.response.text());
      return {
        score: clamp(parsed.score),
        summary: String(parsed.summary || '').slice(0, 500),
        strengths: (parsed.strengths || []).slice(0, 4).map(String),
        gaps: (parsed.gaps || []).slice(0, 4).map(String),
        model: modelName,
      };
    } catch (err) {
      lastError = err;
      logger.warn(`Candidate ranking failed on ${modelName}: ${err.message}`);
      if (isRetryable(err)) continue;
      if (err instanceof ApiError) throw err;
    }
  }

  logger.warn(`Candidate ranking failed: ${lastError?.message}`);
  return {
    score: null,
    summary: 'Ranking failed — try again later',
    strengths: [],
    gaps: [],
    model: null,
  };
};
