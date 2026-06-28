import {
  addAttachment,
  addAttachmentFile,
  addStudentNote,
  deleteAttachment,
  deleteStudentNote,
  getKanbanBoard,
  getTrackingAnalytics,
  getTrackingDetail,
  updateStudentNote,
  updateTrackStatus,
} from '../services/applicationTrackingService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const kanbanHandler = asyncHandler(async (req, res) => {
  const board = await getKanbanBoard(req.user._id);
  res.status(200).json({ success: true, data: board });
});

export const trackingAnalyticsHandler = asyncHandler(async (req, res) => {
  const analytics = await getTrackingAnalytics(req.user._id);
  res.status(200).json({ success: true, data: { analytics } });
});

export const trackingDetailHandler = asyncHandler(async (req, res) => {
  const result = await getTrackingDetail(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: result });
});

export const updateTrackStatusHandler = asyncHandler(async (req, res) => {
  const application = await updateTrackStatus(
    req.params.id,
    req.user._id,
    req.body.trackStatus,
    req.body.note,
  );
  res.status(200).json({ success: true, message: 'Status updated', data: { application } });
});

export const addNoteHandler = asyncHandler(async (req, res) => {
  const application = await addStudentNote(req.params.id, req.user._id, req.body.text);
  res.status(201).json({ success: true, message: 'Note added', data: { application } });
});

export const updateNoteHandler = asyncHandler(async (req, res) => {
  const application = await updateStudentNote(
    req.params.id,
    req.user._id,
    req.params.noteId,
    req.body.text,
  );
  res.status(200).json({ success: true, message: 'Note updated', data: { application } });
});

export const deleteNoteHandler = asyncHandler(async (req, res) => {
  const application = await deleteStudentNote(req.params.id, req.user._id, req.params.noteId);
  res.status(200).json({ success: true, message: 'Note deleted', data: { application } });
});

export const addAttachmentUrlHandler = asyncHandler(async (req, res) => {
  const application = await addAttachment(req.params.id, req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Attachment added', data: { application } });
});

export const addAttachmentFileHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }
  const application = await addAttachmentFile(req.params.id, req.user._id, req.file);
  res.status(201).json({ success: true, message: 'File uploaded', data: { application } });
});

export const deleteAttachmentHandler = asyncHandler(async (req, res) => {
  const application = await deleteAttachment(
    req.params.id,
    req.user._id,
    req.params.attachmentId,
  );
  res.status(200).json({ success: true, message: 'Attachment removed', data: { application } });
});
