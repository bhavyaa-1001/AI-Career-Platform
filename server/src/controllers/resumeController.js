import { parseUploadedResume, saveImportedResume } from '../services/resumeImportService.js';
import { exportResumePdf } from '../services/resumePdfService.js';
import { applyRewrite, generateRewrite } from '../services/resumeRewriteService.js';
import {
  createResume,
  deleteResume,
  duplicateResume,
  getResumeById,
  getResumeVersion,
  getResumeVersions,
  getUserResumes,
  importFromProfile,
  restoreResumeVersion,
  updateResume,
} from '../services/resumeService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listResumes = asyncHandler(async (req, res) => {
  const resumes = await getUserResumes(req.user._id);
  res.status(200).json({ success: true, data: { resumes } });
});

export const getResume = asyncHandler(async (req, res) => {
  const resume = await getResumeById(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: { resume } });
});

export const createResumeHandler = asyncHandler(async (req, res) => {
  const resume = await createResume(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Resume created', data: { resume } });
});

export const updateResumeHandler = asyncHandler(async (req, res) => {
  const { versionLabel, ...data } = req.body;
  const resume = await updateResume(req.params.id, req.user._id, data, {
    autosave: false,
    versionLabel: versionLabel || 'Manual save',
  });
  res.status(200).json({ success: true, message: 'Resume saved', data: { resume } });
});

export const autosaveResumeHandler = asyncHandler(async (req, res) => {
  const resume = await updateResume(req.params.id, req.user._id, req.body, {
    autosave: true,
    versionLabel: 'Auto-save',
  });
  res.status(200).json({ success: true, data: { resume } });
});

export const deleteResumeHandler = asyncHandler(async (req, res) => {
  await deleteResume(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Resume deleted' });
});

export const duplicateResumeHandler = asyncHandler(async (req, res) => {
  const resume = await duplicateResume(req.params.id, req.user._id);
  res.status(201).json({ success: true, message: 'Resume duplicated', data: { resume } });
});

export const importProfileHandler = asyncHandler(async (req, res) => {
  const resume = await importFromProfile(req.user._id, req.body.title);
  res.status(201).json({ success: true, message: 'Imported from profile', data: { resume } });
});

export const parseImportHandler = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Resume file is required');
  const result = await parseUploadedResume(req.file);
  res.status(200).json({
    success: true,
    message: 'Resume parsed successfully. Review and edit before saving.',
    data: result,
  });
});

export const saveImportHandler = asyncHandler(async (req, res) => {
  const resume = await saveImportedResume(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Imported resume saved', data: { resume } });
});

const sendPdfResponse = (res, { buffer, filename }) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
  res.setHeader('Content-Length', buffer.length);
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(buffer);
};

export const exportPdfGetHandler = asyncHandler(async (req, res) => {
  const result = await exportResumePdf(req.params.id, req.user._id);
  sendPdfResponse(res, result);
});

export const exportPdfPostHandler = asyncHandler(async (req, res) => {
  const hasOverride = req.body && Object.keys(req.body).length > 0;
  const result = await exportResumePdf(req.params.id, req.user._id, hasOverride ? req.body : null);
  sendPdfResponse(res, result);
});

export const listVersionsHandler = asyncHandler(async (req, res) => {
  const versions = await getResumeVersions(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: { versions } });
});

export const getVersionHandler = asyncHandler(async (req, res) => {
  const version = await getResumeVersion(req.params.id, req.params.versionId, req.user._id);
  res.status(200).json({ success: true, data: { version } });
});

export const restoreVersionHandler = asyncHandler(async (req, res) => {
  const resume = await restoreResumeVersion(req.params.id, req.params.versionId, req.user._id);
  res.status(200).json({ success: true, message: 'Version restored', data: { resume } });
});

export const rewriteResumeHandler = asyncHandler(async (req, res) => {
  const result = await generateRewrite(req.params.id, req.user._id, req.body);
  res.status(200).json({ success: true, message: 'Rewrite generated', data: result });
});

export const applyRewriteHandler = asyncHandler(async (req, res) => {
  const resume = await applyRewrite(req.params.id, req.user._id, req.body);
  res.status(200).json({ success: true, message: 'AI rewrite applied', data: { resume } });
});
