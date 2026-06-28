import { GoogleGenerativeAI } from '@google/generative-ai';

import { env, isGeminiConfigured } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

const FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'];

const MODE_LABELS = {
  summary: 'Professional Summary',
  experience: 'Experience',
  projects: 'Projects',
  achievements: 'Achievements',
  grammar: 'Grammar',
  actionVerbs: 'Action Verbs',
  keywords: 'Keywords',
};

const OUTPUT_SCHEMA = `{
  "summary": { "text": string } | null,
  "experience": [{ "id": string, "description": string, "title": string | null }] | null,
  "projects": [{ "id": string, "description": string, "title": string | null }] | null,
  "achievements": [{ "id": string, "description": string, "title": string | null }] | null,
  "skills": [{ "id": string, "name": string }] | null,
  "changes": [{ "section": string, "itemId": string | null, "field": string, "label": string, "before": string, "after": string }]
}`;

const buildModeInstructions = (mode) => {
  switch (mode) {
    case 'summary':
      return 'Rewrite the professional summary to be compelling, concise (3-5 sentences), and ATS-friendly. Preserve factual accuracy.';
    case 'experience':
      return 'Rewrite experience descriptions using strong action verbs, quantifiable metrics where possible, and bullet-style lines (use • or -). Keep each role factual.';
    case 'projects':
      return 'Rewrite project descriptions to highlight impact, technologies, and outcomes. Use bullet-style lines.';
    case 'achievements':
      return 'Rewrite achievements to be concise, impactful, and results-oriented.';
    case 'grammar':
      return 'Fix grammar, spelling, punctuation, and clarity across all provided text fields. Do not change meaning or add false claims.';
    case 'actionVerbs':
      return 'Replace weak phrasing with strong action verbs (Led, Built, Optimized, etc.). Add metrics where reasonable. Use bullet-style lines for descriptions.';
    case 'keywords':
      return 'Naturally weave in relevant ATS keywords for the target role. Add missing skills to the skills array if appropriate. Do not keyword-stuff.';
    default:
      return 'Improve the resume content for ATS and readability.';
  }
};

const buildPrompt = ({ mode, content, targetRole, targetJobDescription, itemId }) => {
  const modeLabel = MODE_LABELS[mode] || mode;
  const scope = itemId ? `Focus only on the item with id "${itemId}".` : `Improve all items in the targeted sections for mode "${mode}".`;

  const sectionsToInclude = getSectionsForMode(mode, content, itemId);

  return `You are an expert resume writer. ${buildModeInstructions(mode)}

Mode: ${mode} (${modeLabel})
${scope}
${targetRole ? `Target role: ${targetRole}` : ''}
${targetJobDescription ? `Job description:\n${targetJobDescription.slice(0, 2000)}` : ''}

Return ONLY valid JSON matching this schema (no markdown):
${OUTPUT_SCHEMA}

Rules:
- Include a "changes" array listing every field you modified with before/after text (truncate before/after to 300 chars in changes if very long).
- Preserve all item "id" values exactly when updating array items.
- Only include fields you actually changed in the top-level keys.
- For keywords mode, you may add new skills (generate new id as uuid-like string) or update descriptions.
- Do not invent employers, dates, or credentials.

Current resume sections (JSON):
${JSON.stringify(sectionsToInclude, null, 2)}`;
};

const getSectionsForMode = (mode, content, itemId) => {
  const filterItems = (items) => (itemId ? items.filter((i) => i.id === itemId) : items);

  if (mode === 'summary') return { summary: content.summary };
  if (mode === 'experience') return { experience: filterItems(content.experience || []) };
  if (mode === 'projects') return { projects: filterItems(content.projects || []) };
  if (mode === 'achievements') return { achievements: filterItems(content.achievements || []) };
  if (['grammar', 'actionVerbs', 'keywords'].includes(mode)) {
    return {
      summary: content.summary,
      experience: filterItems(content.experience || []),
      projects: filterItems(content.projects || []),
      achievements: filterItems(content.achievements || []),
      skills: content.skills || [],
    };
  }
  return { summary: content.summary };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errorMessage = (err) => String(err?.message || err || '').toLowerCase();

const isRateLimitError = (err) => {
  const msg = errorMessage(err);
  return msg.includes('429') || msg.includes('quota') || msg.includes('rate limit');
};

const isModelNotFoundError = (err) => {
  const msg = errorMessage(err);
  return msg.includes('404') || msg.includes('not found');
};

const isServiceUnavailableError = (err) => {
  const msg = errorMessage(err);
  return msg.includes('503') || msg.includes('unavailable') || msg.includes('high demand');
};

const isRetryableError = (err) =>
  isRateLimitError(err) || isModelNotFoundError(err) || isServiceUnavailableError(err)
  || (err instanceof ApiError && err.statusCode === 502);

const getModelsToTry = () => {
  const primary = env.GEMINI_MODEL;
  const chain = [primary, ...FALLBACK_MODELS.filter((m) => m !== primary)];
  return [...new Set(chain)];
};

const parseJsonResponse = (text) => {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new ApiError(502, 'AI returned invalid JSON.');
  }
};

const extractResponseText = (result) => {
  const response = result?.response;
  const candidate = response?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  const text = parts.map((p) => p.text || '').join('').trim();
  if (text) return text;
  return response.text();
};

const runGeminiJson = async (prompt) => {
  if (!isGeminiConfigured) throw new ApiError(503, 'AI is not configured. Set GEMINI_API_KEY.');

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const models = getModelsToTry();
  let lastError = null;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
      });
      let result;
      try {
        result = await model.generateContent(prompt);
      } catch (err) {
        if (isRetryableError(err)) {
          await sleep(isRateLimitError(err) ? 5000 : 2000);
          result = await model.generateContent(prompt);
        } else throw err;
      }
      const parsed = parseJsonResponse(extractResponseText(result));
      return { parsed, model: modelName };
    } catch (err) {
      lastError = err;
      logger.warn(`Rewrite failed on ${modelName}: ${err.message}`);
      if (isRetryableError(err)) continue;
      throw err instanceof ApiError ? err : new ApiError(502, 'AI rewrite failed.');
    }
  }
  throw lastError instanceof ApiError ? lastError : new ApiError(502, 'AI rewrite failed. Try again.');
};

const mergeArrayUpdates = (current, updates) => {
  if (!updates?.length) return current;
  const map = new Map(updates.filter((u) => u.id).map((u) => [u.id, u]));
  const merged = (current || []).map((item) => {
    const upd = map.get(item.id);
    if (!upd) return item;
    return {
      ...item,
      ...(upd.title != null && upd.title !== '' ? { title: String(upd.title).slice(0, 120) } : {}),
      ...(upd.description != null ? { description: String(upd.description).slice(0, 3000) } : {}),
      ...(upd.name != null ? { name: String(upd.name).slice(0, 80) } : {}),
    };
  });
  updates.forEach((upd) => {
    if (upd.id && !current?.some((i) => i.id === upd.id) && upd.name) {
      merged.push({ id: upd.id, name: String(upd.name).slice(0, 80), proficiency: 'Intermediate' });
    }
  });
  return merged;
};

export const mergeRewriteIntoContent = (content, patch) => {
  const next = { ...content };
  if (patch.summary?.text != null) {
    next.summary = { ...next.summary, text: String(patch.summary.text).slice(0, 2000) };
  }
  if (patch.experience) next.experience = mergeArrayUpdates(content.experience, patch.experience);
  if (patch.projects) next.projects = mergeArrayUpdates(content.projects, patch.projects);
  if (patch.achievements) next.achievements = mergeArrayUpdates(content.achievements, patch.achievements);
  if (patch.skills) next.skills = mergeArrayUpdates(content.skills, patch.skills);
  return next;
};

export const rewriteResumeContent = async ({ mode, content, targetRole, targetJobDescription, itemId }) => {
  const prompt = buildPrompt({ mode, content, targetRole, targetJobDescription, itemId });
  const { parsed, model } = await runGeminiJson(prompt);

  const patch = {
    summary: parsed.summary || undefined,
    experience: parsed.experience || undefined,
    projects: parsed.projects || undefined,
    achievements: parsed.achievements || undefined,
    skills: parsed.skills || undefined,
  };

  const updatedContent = mergeRewriteIntoContent(content, patch);
  const changes = (parsed.changes || []).slice(0, 20).map((c) => ({
    section: String(c.section || '').slice(0, 40),
    itemId: c.itemId || null,
    field: String(c.field || 'text').slice(0, 40),
    label: String(c.label || c.section || 'Change').slice(0, 120),
    before: String(c.before || '').slice(0, 500),
    after: String(c.after || '').slice(0, 500),
  }));

  return {
    mode,
    modeLabel: MODE_LABELS[mode] || mode,
    patch,
    updatedContent,
    changes,
    model,
  };
};

export { MODE_LABELS };
