import { CodingDraft } from '../models/CodingDraft.js';
import { CodingSubmission } from '../models/CodingSubmission.js';
import { ProblemBookmark } from '../models/ProblemBookmark.js';
import { ApiError } from '../utils/ApiError.js';

import { getProblemDocument, getProblemDocumentBySlug, updateProblemStats } from './codingProblemService.js';
import { recordSubmissionStats } from './codingProfileService.js';
import { runTestCases } from './judge0Service.js';

const upsertBookmark = async (userId, problemId, updates) => {
  let bookmark = await ProblemBookmark.findOne({ userId, problemId });
  if (!bookmark) {
    bookmark = await ProblemBookmark.create({ userId, problemId, ...updates });
  } else {
    Object.assign(bookmark, updates);
    await bookmark.save();
  }
  return bookmark;
};

export const runCode = async (userId, { problemId, slug, language, sourceCode }) => {
  const problem = slug
    ? await getProblemDocumentBySlug(slug)
    : await getProblemDocument(problemId);

  const testCases = problem.sampleTestCases;
  if (!testCases.length) throw new ApiError(422, 'Problem has no sample test cases');

  const result = await runTestCases({
    sourceCode,
    language,
    testCases,
    timeLimitMs: problem.timeLimitMs,
    memoryLimitKb: problem.memoryLimitKb,
  });

  const submission = await CodingSubmission.create({
    userId,
    problemId: problem._id,
    language,
    sourceCode,
    status: result.status,
    executionTimeMs: result.executionTimeMs,
    memoryKb: result.memoryKb,
    passedTestCases: result.passedCount,
    totalTestCases: result.totalCount,
    testResults: result.testResults,
    compileOutput: result.compileOutput,
    runtimeError: result.runtimeError,
    isRun: true,
  });

  await upsertBookmark(userId, problem._id, {
    status: 'attempted',
    lastAttemptedAt: new Date(),
  });

  return submission.toSafeObject();
};

export const submitCode = async (userId, { problemId, slug, language, sourceCode, contestId = null }) => {
  const problem = slug
    ? await getProblemDocumentBySlug(slug)
    : await getProblemDocument(problemId);

  const testCases = [...problem.sampleTestCases, ...problem.hiddenTestCases];
  if (!testCases.length) throw new ApiError(422, 'Problem has no test cases');

  const result = await runTestCases({
    sourceCode,
    language,
    testCases,
    timeLimitMs: problem.timeLimitMs,
    memoryLimitKb: problem.memoryLimitKb,
  });

  const isAccepted = result.status === 'accepted';

  const submission = await CodingSubmission.create({
    userId,
    problemId: problem._id,
    contestId,
    language,
    sourceCode,
    status: result.status,
    executionTimeMs: result.executionTimeMs,
    memoryKb: result.memoryKb,
    passedTestCases: result.passedCount,
    totalTestCases: result.totalCount,
    testResults: result.testResults.map((tr, i) => ({
      ...tr,
      input: i < problem.sampleTestCases.length ? tr.input : '[hidden]',
      expectedOutput: i < problem.sampleTestCases.length ? tr.expectedOutput : '[hidden]',
    })),
    compileOutput: result.compileOutput,
    runtimeError: result.runtimeError,
    isRun: false,
  });

  await updateProblemStats(problem._id, { accepted: isAccepted });

  const existingSolve = await ProblemBookmark.findOne({
    userId, problemId: problem._id, status: 'solved',
  });
  const isFirstSolve = isAccepted && !existingSolve;

  if (isAccepted) {
    await upsertBookmark(userId, problem._id, {
      status: 'solved',
      solvedAt: new Date(),
      lastAttemptedAt: new Date(),
    });
  } else {
    await upsertBookmark(userId, problem._id, {
      status: 'attempted',
      lastAttemptedAt: new Date(),
    });
  }

  await recordSubmissionStats(userId, {
    language,
    difficulty: problem.difficulty,
    isAccepted,
    points: problem.points,
    isFirstSolve,
  });

  return submission.toSafeObject();
};

export const saveDraft = async (userId, { problemId, language, sourceCode }) => {
  const draft = await CodingDraft.findOneAndUpdate(
    { userId, problemId },
    { language, sourceCode },
    { upsert: true, new: true },
  );
  return draft.toSafeObject();
};

export const getDraft = async (userId, problemId) => {
  const draft = await CodingDraft.findOne({ userId, problemId });
  return draft?.toSafeObject() || null;
};

export const listSubmissions = async (userId, { problemId, page = 1, limit = 20 } = {}) => {
  const filter = { userId, isRun: false };
  if (problemId) filter.problemId = problemId;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    CodingSubmission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate('problemId', 'title slug difficulty'),
    CodingSubmission.countDocuments(filter),
  ]);

  return {
    submissions: items.map((s) => ({
      ...s.toSafeObject(),
      problem: s.problemId ? {
        id: s.problemId._id.toString(),
        title: s.problemId.title,
        slug: s.problemId.slug,
        difficulty: s.problemId.difficulty,
      } : null,
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const getSubmission = async (id, userId) => {
  const submission = await CodingSubmission.findOne({ _id: id, userId })
    .populate('problemId', 'title slug difficulty');
  if (!submission) throw new ApiError(404, 'Submission not found');
  return {
    ...submission.toSafeObject(),
    problem: submission.problemId ? {
      id: submission.problemId._id.toString(),
      title: submission.problemId.title,
      slug: submission.problemId.slug,
      difficulty: submission.problemId.difficulty,
    } : null,
  };
};
