import { isGeminiConfigured } from '../config/env.js';
import {
  deleteResumeMatch,
  generateResumeMatch,
  getMatchDashboard,
  getResumeMatchById,
  listResumeMatches,
} from '../services/resumeMatchService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const matchStatusHandler = asyncHandler(async (_req, res) => {
  res.status(200).json({ success: true, data: { configured: isGeminiConfigured } });
});

export const generateMatchHandler = asyncHandler(async (req, res) => {
  const match = await generateResumeMatch(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Comparison generated', data: { match } });
});

export const listMatchesHandler = asyncHandler(async (req, res) => {
  const result = await listResumeMatches(req.user._id, req.query);
  res.status(200).json({ success: true, data: result });
});

export const getMatchHandler = asyncHandler(async (req, res) => {
  const match = await getResumeMatchById(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: { match } });
});

export const deleteMatchHandler = asyncHandler(async (req, res) => {
  await deleteResumeMatch(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Comparison deleted' });
});

export const matchDashboardHandler = asyncHandler(async (req, res) => {
  const dashboard = await getMatchDashboard(req.user._id);
  res.status(200).json({ success: true, data: { dashboard } });
});
