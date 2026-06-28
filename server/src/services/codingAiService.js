import { CodeReview } from '../models/CodeReview.js';
import { HintSession } from '../models/HintSession.js';
import { ApiError } from '../utils/ApiError.js';

import { getProblemDocument } from './codingProblemService.js';
import {
  generateDryRunWithAI,
  generateHintWithAI,
  generateVisualExplanationWithAI,
  reviewCodeWithAI,
} from './geminiCodingService.js';

export const createCodeReview = async (userId, { problemId, submissionId, language, sourceCode }) => {
  const problem = await getProblemDocument(problemId);

  const review = await reviewCodeWithAI({
    sourceCode,
    language,
    problemTitle: problem.title,
    problemDescription: problem.description,
  });

  const doc = await CodeReview.create({
    userId,
    problemId,
    submissionId,
    language,
    sourceCode,
    ...review,
  });

  return doc.toSafeObject();
};

export const listCodeReviews = async (userId, { problemId, page = 1, limit = 10 } = {}) => {
  const filter = { userId };
  if (problemId) filter.problemId = problemId;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    CodeReview.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    CodeReview.countDocuments(filter),
  ]);

  return {
    reviews: items.map((r) => r.toSafeObject()),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const requestHint = async (userId, { problemId, level }) => {
  const problem = await getProblemDocument(problemId);
  let session = await HintSession.findOne({ userId, problemId });

  if (!session) {
    session = await HintSession.create({ userId, problemId, hintsUsed: 0, history: [] });
  }

  if (level > session.hintsUsed + 1) {
    throw new ApiError(400, `Request hint ${session.hintsUsed + 1} first before hint ${level}`);
  }

  const previousHints = session.history.filter((h) => h.type === 'hint').map((h) => h.content);

  if (level <= session.hintsUsed) {
    const existing = session.history.find((h) => h.type === 'hint' && h.level === level);
    if (existing) return { content: existing.content, level, hintsUsed: session.hintsUsed };
  }

  const hintLevel = Math.min(level, 4);
  const result = await generateHintWithAI({
    level: hintLevel,
    problemTitle: problem.title,
    problemDescription: problem.description,
    language: 'python',
    previousHints,
  });

  session.hintsUsed = Math.max(session.hintsUsed, hintLevel);
  session.history.push({ level: hintLevel, type: 'hint', content: result.content });
  await session.save();

  return { content: result.content, level: hintLevel, hintsUsed: session.hintsUsed };
};

export const requestDryRun = async (userId, { problemId, language, sourceCode }) => {
  const problem = await getProblemDocument(problemId);
  const sampleInput = problem.sampleTestCases[0]?.input || '';

  const result = await generateDryRunWithAI({
    sourceCode,
    language,
    problemTitle: problem.title,
    sampleInput,
  });

  let session = await HintSession.findOne({ userId, problemId });
  if (!session) session = await HintSession.create({ userId, problemId, history: [] });
  session.history.push({ level: 0, type: 'dry_run', content: result.content });
  await session.save();

  return { content: result.content };
};

export const requestVisualExplanation = async (userId, { problemId }) => {
  const problem = await getProblemDocument(problemId);

  const result = await generateVisualExplanationWithAI({
    problemTitle: problem.title,
    problemDescription: problem.description,
  });

  let session = await HintSession.findOne({ userId, problemId });
  if (!session) session = await HintSession.create({ userId, problemId, history: [] });
  session.history.push({ level: 0, type: 'visual', content: result.content });
  await session.save();

  return { content: result.content };
};

export const getHintSession = async (userId, problemId) => {
  const session = await HintSession.findOne({ userId, problemId });
  return session?.toSafeObject() || { hintsUsed: 0, history: [] };
};
