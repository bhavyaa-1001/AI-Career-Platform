import { isGeminiConfigured } from '../config/env.js';
import {
  createCoverLetter,
  deleteCoverLetter,
  exportCoverLetterPdf,
  getCoverLetterById,
  listCoverLetters,
  updateCoverLetter,
} from '../services/coverLetterService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const ensureGemini = () => {
  if (!isGeminiConfigured) {
    throw new ApiError(503, 'AI is not configured. Set GEMINI_API_KEY in server environment.');
  }
};

const sendPdfResponse = (res, { buffer, filename }) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
  res.setHeader('Content-Length', buffer.length);
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(buffer);
};

export const generateCoverLetterHandler = asyncHandler(async (req, res) => {
  ensureGemini();
  const coverLetter = await createCoverLetter(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Cover letter generated', data: { coverLetter } });
});

export const listCoverLettersHandler = asyncHandler(async (req, res) => {
  const result = await listCoverLetters(req.user._id, req.query);
  res.status(200).json({ success: true, data: result });
});

export const getCoverLetterHandler = asyncHandler(async (req, res) => {
  const coverLetter = await getCoverLetterById(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: { coverLetter } });
});

export const updateCoverLetterHandler = asyncHandler(async (req, res) => {
  const coverLetter = await updateCoverLetter(req.params.id, req.user._id, req.body);
  res.status(200).json({ success: true, message: 'Cover letter saved', data: { coverLetter } });
});

export const deleteCoverLetterHandler = asyncHandler(async (req, res) => {
  await deleteCoverLetter(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Cover letter deleted' });
});

export const exportCoverLetterPdfHandler = asyncHandler(async (req, res) => {
  const result = await exportCoverLetterPdf(req.params.id, req.user._id);
  sendPdfResponse(res, result);
});

export const coverLetterStatusHandler = asyncHandler(async (_req, res) => {
  res.status(200).json({ success: true, data: { configured: isGeminiConfigured } });
});
