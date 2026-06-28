import { Router } from 'express';

import {
  achievementsHandler, adminGetProblemHandler, bookmarkStatsHandler, codeReviewHandler,
  contestAnalyticsHandler, contestLeaderboardHandler, createContestHandler, createProblemHandler,
  dailyCalendarHandler, dailyChallengeHandler, dashboardHandler, deleteContestHandler,
  deleteProblemHandler, dryRunHandler, getContestHandler, getDraftHandler, getProblemHandler,
  getSubmissionHandler, heatmapHandler, hintHandler, hintSessionHandler, joinContestHandler,
  leaderboardHandler, listBookmarksHandler, listContestsHandler, listProblemsHandler,
  listReviewsHandler, listSubmissionsHandler, progressHandler, runCodeHandler,
  saveDraftHandler, codingStatusHandler, submitCodeHandler, toggleBookmarkHandler,
  toggleFavoriteHandler, updateContestHandler, updateProblemHandler, virtualContestHandler,
  visualHintHandler,
} from '../../controllers/codingController.js';
import { authenticate, authorize, optionalAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  bookmarkToggleSchema, codeReviewSchema, createContestSchema, createProblemSchema,
  draftParamSchema, dryRunSchema, hintSchema, hintSessionSchema, idParamSchema,
  leaderboardSchema, listBookmarksSchema, listContestsSchema, listProblemsSchema,
  listReviewsSchema, listSubmissionsSchema, runCodeSchema, saveDraftSchema,
  slugParamSchema, submitCodeSchema, updateContestSchema, updateProblemSchema, visualHintSchema,
} from '../../validators/codingValidator.js';

const router = Router();

router.get('/status', codingStatusHandler);

// Public / optional auth
router.get('/problems', validate(listProblemsSchema), listProblemsHandler);
router.get('/problems/:slug', validate(slugParamSchema), optionalAuth, getProblemHandler);
router.get('/leaderboard', validate(leaderboardSchema), optionalAuth, leaderboardHandler);
router.get('/daily', dailyChallengeHandler);
router.get('/contests', validate(listContestsSchema), listContestsHandler);
router.get('/contests/:id', validate(idParamSchema), getContestHandler);
router.get('/contests/:id/leaderboard', validate(idParamSchema), contestLeaderboardHandler);

router.use(authenticate);

// Workspace
router.post('/run', validate(runCodeSchema), runCodeHandler);
router.post('/submit', validate(submitCodeSchema), submitCodeHandler);
router.post('/draft', validate(saveDraftSchema), saveDraftHandler);
router.get('/draft/:problemId', validate(draftParamSchema), getDraftHandler);
router.get('/submissions', validate(listSubmissionsSchema), listSubmissionsHandler);
router.get('/submissions/:id', validate(idParamSchema), getSubmissionHandler);

// Bookmarks
router.post('/bookmarks/toggle', validate(bookmarkToggleSchema), toggleBookmarkHandler);
router.post('/bookmarks/favorite', validate(bookmarkToggleSchema), toggleFavoriteHandler);
router.get('/bookmarks', validate(listBookmarksSchema), listBookmarksHandler);
router.get('/bookmarks/stats', bookmarkStatsHandler);

// Daily & progress
router.get('/daily/calendar', dailyCalendarHandler);
router.get('/progress', progressHandler);
router.get('/achievements', achievementsHandler);
router.get('/dashboard', dashboardHandler);
router.get('/heatmap', heatmapHandler);

// Contests (authenticated)
router.post('/contests/:id/join', validate(idParamSchema), joinContestHandler);
router.post('/contests/:id/virtual', validate(idParamSchema), virtualContestHandler);

// AI
router.post('/ai/review', validate(codeReviewSchema), codeReviewHandler);
router.get('/ai/reviews', validate(listReviewsSchema), listReviewsHandler);
router.post('/ai/hint', validate(hintSchema), hintHandler);
router.post('/ai/dry-run', validate(dryRunSchema), dryRunHandler);
router.post('/ai/visual', validate(visualHintSchema), visualHintHandler);
router.get('/ai/hints/:problemId', validate(hintSessionSchema), hintSessionHandler);

// Admin only
const admin = Router();
admin.use(authorize('admin', 'sub_admin'));

admin.get('/problems/:id', validate(idParamSchema), adminGetProblemHandler);
admin.post('/problems', validate(createProblemSchema), createProblemHandler);
admin.put('/problems/:id', validate(updateProblemSchema), updateProblemHandler);
admin.delete('/problems/:id', validate(idParamSchema), deleteProblemHandler);

admin.post('/contests', validate(createContestSchema), createContestHandler);
admin.put('/contests/:id', validate(updateContestSchema), updateContestHandler);
admin.delete('/contests/:id', validate(idParamSchema), deleteContestHandler);
admin.get('/contests/:id/analytics', validate(idParamSchema), contestAnalyticsHandler);

router.use('/admin', admin);

export default router;
