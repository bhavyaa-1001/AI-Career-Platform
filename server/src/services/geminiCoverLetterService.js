import { GoogleGenerativeAI } from '@google/generative-ai';

import { env, isGeminiConfigured } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

const FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'];

const LENGTH_GUIDE = {
  short: 'about 150 words (3 short paragraphs)',
  medium: 'about 250 words (4 paragraphs)',
  long: 'about 400 words (5 paragraphs)',
};

const TONE_GUIDE = {
  professional: 'professional and polished',
  confident: 'confident and assertive without arrogance',
  friendly: 'warm and approachable while remaining professional',
  formal: 'formal and traditional business tone',
  enthusiastic: 'enthusiastic and motivated',
};

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
    return { body: cleaned };
  }
};

const buildPrompt = ({ resumeText, jobDescription, company, role, tone, length, applicantName }) => {
  const toneDesc = TONE_GUIDE[tone] || TONE_GUIDE.professional;
  const lengthDesc = LENGTH_GUIDE[length] || LENGTH_GUIDE.medium;

  return `You are an expert career coach writing tailored cover letters.

Write a cover letter for:
- Company: ${company}
- Role: ${role}
- Tone: ${toneDesc}
- Length: ${lengthDesc}
${applicantName ? `- Applicant name: ${applicantName}` : ''}

Job description:
---
${jobDescription.slice(0, 4000)}
---

Applicant resume:
---
${resumeText.slice(0, 6000)}
---

Return ONLY valid JSON (no markdown):
{ "body": "full cover letter text with paragraph breaks as \\n\\n" }

Rules:
- Address hiring manager generically (e.g. "Dear Hiring Manager") unless a name is in the job description.
- Highlight 2-3 relevant achievements from the resume that match the job.
- Do not invent credentials, employers, or degrees not in the resume.
- Include a strong opening and closing call to action.
- No subject line — letter body only.`;
};

const countWords = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length;

export const generateCoverLetterText = async (inputs) => {
  if (!isGeminiConfigured) {
    throw new ApiError(503, 'AI is not configured. Set GEMINI_API_KEY.');
  }

  const prompt = buildPrompt(inputs);
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  let lastError = null;

  for (const modelName of getModelsToTry()) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.55, responseMimeType: 'application/json' },
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
      const body = String(parsed.body || '').trim().slice(0, 12000);
      if (body.length < 80) {
        throw new ApiError(502, 'AI returned an empty cover letter. Try again.');
      }
      return { body, model: modelName, wordCount: countWords(body) };
    } catch (err) {
      lastError = err;
      logger.warn(`Cover letter generation failed on ${modelName}: ${err.message}`);
      if (isRetryable(err)) continue;
      if (err instanceof ApiError) throw err;
      throw new ApiError(502, 'Cover letter generation failed.');
    }
  }
  if (lastError instanceof ApiError) throw lastError;
  throw new ApiError(502, 'Cover letter generation failed. Try again.');
};
