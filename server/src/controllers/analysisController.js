import { isGeminiConfigured } from '../config/env.js';
import {
  analyzeExistingResume,
  analyzeUploadedResume,
  getAnalysisById,
  getAnalyticsSummary,
  listAnalyses,
} from '../services/resumeAnalysisService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const ensureGemini = () => {
  if (!isGeminiConfigured) {
    throw new ApiError(503, 'AI analysis is not configured. Set GEMINI_API_KEY in server environment.');
  }
};

export const analyzeUploadHandler = asyncHandler(async (req, res) => {
  ensureGemini();
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const analysis = await analyzeUploadedResume(req.user._id, req.file, req.body);
  res.status(201).json({
    success: true,
    message: analysis.status === 'completed' ? 'Resume analyzed successfully' : 'Analysis failed',
    data: { analysis },
  });
});

export const analyzeResumeHandler = asyncHandler(async (req, res) => {
  ensureGemini();
  const analysis = await analyzeExistingResume(req.params.resumeId, req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: analysis.status === 'completed' ? 'Resume analyzed successfully' : 'Analysis failed',
    data: { analysis },
  });
});

export const listAnalysesHandler = asyncHandler(async (req, res) => {
  const result = await listAnalyses(req.user._id, req.query);
  res.status(200).json({ success: true, data: result });
});

export const getAnalysisHandler = asyncHandler(async (req, res) => {
  const analysis = await getAnalysisById(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: { analysis } });
});

export const analyticsSummaryHandler = asyncHandler(async (req, res) => {
  const analytics = await getAnalyticsSummary(req.user._id);
  res.status(200).json({ success: true, data: { analytics } });
});

export const analysisStatusHandler = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    data: { configured: isGeminiConfigured },
  });
});
