import { isGeminiConfigured, isJudge0Configured } from '../config/env.js';
import {
  createCodeReview, getHintSession, listCodeReviews, requestDryRun,
  requestHint, requestVisualExplanation,
} from '../services/codingAiService.js';
import {
  getBookmarkStats, getProblemUserState, listBookmarks, toggleBookmark, toggleFavorite,
} from '../services/codingBookmarkService.js';
import {
  createContest, deleteContest, getContest, getContestAnalytics, getContestLeaderboard,
  joinContest, listContests, startVirtualContest, updateContest,
} from '../services/codingContestService.js';
import {
  getAchievements, getActivityHeatmap, getCodingDashboard, getProgress,
} from '../services/codingDashboardService.js';
import {
  getDraft, listSubmissions, runCode, saveDraft, submitCode, getSubmission,
} from '../services/codingExecutionService.js';
import {
  createProblem, deleteProblem, getProblemById, getProblemBySlug, listProblems, updateProblem,
} from '../services/codingProblemService.js';
import { getLeaderboardEntries, getUserRank } from '../services/codingProfileService.js';
import { getOrCreateDailyChallenge, getDailyCalendar } from '../services/dailyChallengeService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const codingStatusHandler = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      judge0Configured: isJudge0Configured,
      geminiConfigured: isGeminiConfigured,
    },
  });
});

// Problems (public list + admin CRUD)
export const listProblemsHandler = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  const result = await listProblems({
    ...req.query,
    status: isAdmin && req.query.status ? req.query.status : 'published',
  });
  res.json({ success: true, data: result });
});

export const getProblemHandler = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  const problem = await getProblemBySlug(req.params.slug, { admin: isAdmin });
  let userState = null;
  if (req.user) {
    userState = await getProblemUserState(req.user._id, problem.id);
  }
  res.json({ success: true, data: { problem, userState } });
});

export const adminGetProblemHandler = asyncHandler(async (req, res) => {
  const problem = await getProblemById(req.params.id, { admin: true });
  res.json({ success: true, data: { problem } });
});

export const createProblemHandler = asyncHandler(async (req, res) => {
  const problem = await createProblem(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Problem created', data: { problem } });
});

export const updateProblemHandler = asyncHandler(async (req, res) => {
  const problem = await updateProblem(req.params.id, req.body);
  res.json({ success: true, message: 'Problem updated', data: { problem } });
});

export const deleteProblemHandler = asyncHandler(async (req, res) => {
  await deleteProblem(req.params.id);
  res.json({ success: true, message: 'Problem deleted' });
});

// Workspace
export const runCodeHandler = asyncHandler(async (req, res) => {
  const submission = await runCode(req.user._id, req.body);
  res.json({ success: true, data: { submission } });
});

export const submitCodeHandler = asyncHandler(async (req, res) => {
  const submission = await submitCode(req.user._id, req.body);
  res.json({ success: true, data: { submission } });
});

export const saveDraftHandler = asyncHandler(async (req, res) => {
  const draft = await saveDraft(req.user._id, req.body);
  res.json({ success: true, data: { draft } });
});

export const getDraftHandler = asyncHandler(async (req, res) => {
  const draft = await getDraft(req.user._id, req.params.problemId);
  res.json({ success: true, data: { draft } });
});

export const listSubmissionsHandler = asyncHandler(async (req, res) => {
  const result = await listSubmissions(req.user._id, req.query);
  res.json({ success: true, data: result });
});

export const getSubmissionHandler = asyncHandler(async (req, res) => {
  const submission = await getSubmission(req.params.id, req.user._id);
  res.json({ success: true, data: { submission } });
});

// Bookmarks
export const toggleBookmarkHandler = asyncHandler(async (req, res) => {
  const bookmark = await toggleBookmark(req.user._id, req.body.problemId);
  res.json({ success: true, data: { bookmark } });
});

export const toggleFavoriteHandler = asyncHandler(async (req, res) => {
  const bookmark = await toggleFavorite(req.user._id, req.body.problemId);
  res.json({ success: true, data: { bookmark } });
});

export const listBookmarksHandler = asyncHandler(async (req, res) => {
  const result = await listBookmarks(req.user._id, req.query);
  res.json({ success: true, data: result });
});

export const bookmarkStatsHandler = asyncHandler(async (req, res) => {
  const stats = await getBookmarkStats(req.user._id);
  res.json({ success: true, data: { stats } });
});

// Leaderboard
export const leaderboardHandler = asyncHandler(async (req, res) => {
  const entries = await getLeaderboardEntries(req.query);
  const myRank = req.user ? await getUserRank(req.user._id, req.query.period) : null;
  res.json({ success: true, data: { entries, myRank } });
});

// Daily challenge
export const dailyChallengeHandler = asyncHandler(async (req, res) => {
  const challenge = await getOrCreateDailyChallenge();
  res.json({ success: true, data: { challenge } });
});

export const dailyCalendarHandler = asyncHandler(async (req, res) => {
  const calendar = await getDailyCalendar(req.user._id);
  res.json({ success: true, data: calendar });
});

// Contests
export const listContestsHandler = asyncHandler(async (req, res) => {
  const result = await listContests(req.query);
  res.json({ success: true, data: result });
});

export const getContestHandler = asyncHandler(async (req, res) => {
  const contest = await getContest(req.params.id);
  res.json({ success: true, data: { contest } });
});

export const createContestHandler = asyncHandler(async (req, res) => {
  const contest = await createContest(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Contest created', data: { contest } });
});

export const updateContestHandler = asyncHandler(async (req, res) => {
  const contest = await updateContest(req.params.id, req.body);
  res.json({ success: true, message: 'Contest updated', data: { contest } });
});

export const deleteContestHandler = asyncHandler(async (req, res) => {
  await deleteContest(req.params.id);
  res.json({ success: true, message: 'Contest deleted' });
});

export const joinContestHandler = asyncHandler(async (req, res) => {
  const participant = await joinContest(req.user._id, req.params.id);
  res.json({ success: true, data: { participant } });
});

export const contestLeaderboardHandler = asyncHandler(async (req, res) => {
  const entries = await getContestLeaderboard(req.params.id);
  res.json({ success: true, data: { entries } });
});

export const contestAnalyticsHandler = asyncHandler(async (req, res) => {
  const analytics = await getContestAnalytics(req.params.id);
  res.json({ success: true, data: analytics });
});

export const virtualContestHandler = asyncHandler(async (req, res) => {
  const contest = await startVirtualContest(req.user._id, req.params.id);
  res.json({ success: true, data: { contest } });
});

// AI
export const codeReviewHandler = asyncHandler(async (req, res) => {
  const review = await createCodeReview(req.user._id, req.body);
  res.status(201).json({ success: true, data: { review } });
});

export const listReviewsHandler = asyncHandler(async (req, res) => {
  const result = await listCodeReviews(req.user._id, req.query);
  res.json({ success: true, data: result });
});

export const hintHandler = asyncHandler(async (req, res) => {
  const hint = await requestHint(req.user._id, req.body);
  res.json({ success: true, data: hint });
});

export const dryRunHandler = asyncHandler(async (req, res) => {
  const result = await requestDryRun(req.user._id, req.body);
  res.json({ success: true, data: result });
});

export const visualHintHandler = asyncHandler(async (req, res) => {
  const result = await requestVisualExplanation(req.user._id, req.body);
  res.json({ success: true, data: result });
});

export const hintSessionHandler = asyncHandler(async (req, res) => {
  const session = await getHintSession(req.user._id, req.params.problemId);
  res.json({ success: true, data: { session } });
});

// Progress & Dashboard
export const progressHandler = asyncHandler(async (req, res) => {
  const progress = await getProgress(req.user._id);
  res.json({ success: true, data: progress });
});

export const achievementsHandler = asyncHandler(async (req, res) => {
  const achievements = await getAchievements(req.user._id);
  res.json({ success: true, data: achievements });
});

export const dashboardHandler = asyncHandler(async (req, res) => {
  const dashboard = await getCodingDashboard(req.user._id);
  res.json({ success: true, data: dashboard });
});

export const heatmapHandler = asyncHandler(async (req, res) => {
  const heatmap = await getActivityHeatmap(req.user._id);
  res.json({ success: true, data: { heatmap } });
});
