import mongoose from 'mongoose';

import {
  Application,
  KANBAN_COLUMNS,
  TRACK_STATUSES,
  TRACK_STATUS_LABELS,
  mapRecruiterStatusToTrack,
} from '../models/Application.js';
import { Job } from '../models/Job.js';
import { JobBookmark } from '../models/JobBookmark.js';
import { ApiError } from '../utils/ApiError.js';

import { uploadResumeFile } from './cloudinaryService.js';

const assertStudentApplication = async (id, userId) => {
  const app = await Application.findOne({ _id: id, applicantId: userId });
  if (!app) throw new ApiError(404, 'Application not found');
  return app;
};

const pushTimeline = (app, { status, title, note = '' }) => {
  app.timeline.push({ status, title, note });
};

export const syncTrackFromRecruiterStatus = (app, recruiterStatus) => {
  const mapped = mapRecruiterStatusToTrack(recruiterStatus);
  if (!mapped || app.trackStatus === 'withdrawn') return;
  if (mapped === app.trackStatus) return;

  app.trackStatus = mapped;
  pushTimeline(app, {
    status: mapped,
    title: `Recruiter update: ${TRACK_STATUS_LABELS[mapped]}`,
    note: `Application marked as ${recruiterStatus} by recruiter`,
  });
};

export const getKanbanBoard = async (userId) => {
  const columns = Object.fromEntries(KANBAN_COLUMNS.map((c) => [c, []]));

  const bookmarks = await JobBookmark.find({ userId }).sort({ createdAt: -1 });
  const bookmarkJobIds = bookmarks.map((b) => b.jobId);
  const applications = await Application.find({ applicantId: userId }).sort({ updatedAt: -1 });

  const appliedJobIds = new Set(applications.map((a) => a.jobId.toString()));
  const savedJobIds = bookmarkJobIds.filter((id) => !appliedJobIds.has(id.toString()));

  if (savedJobIds.length) {
    const savedJobs = await Job.find({ _id: { $in: savedJobIds }, status: 'open' });
    const jobMap = Object.fromEntries(savedJobs.map((j) => [j._id.toString(), j]));
    bookmarks.forEach((b) => {
      const job = jobMap[b.jobId.toString()];
      if (!job) return;
      columns.saved.push({
        type: 'saved',
        id: b._id.toString(),
        jobId: job._id.toString(),
        jobTitle: job.title,
        companyName: job.companyName,
        location: job.location,
        employmentType: job.employmentType,
        savedAt: b.createdAt,
      });
    });
  }

  applications.forEach((app) => {
    const col = TRACK_STATUSES.includes(app.trackStatus) ? app.trackStatus : 'applied';
    columns[col].push({
      type: 'application',
      ...app.toSafeObject(),
    });
  });

  return { columns, columnOrder: KANBAN_COLUMNS };
};

export const getTrackingAnalytics = async (userId) => {
  const uid = new mongoose.Types.ObjectId(userId);

  const [applications, bookmarks, statusCounts] = await Promise.all([
    Application.find({ applicantId: userId }),
    JobBookmark.countDocuments({ userId }),
    Application.aggregate([
      { $match: { applicantId: uid } },
      { $group: { _id: '$trackStatus', count: { $sum: 1 } } },
    ]),
  ]);

  const byStatus = Object.fromEntries(statusCounts.map((s) => [s._id, s.count]));
  const total = applications.length;
  const active = applications.filter(
    (a) => !['rejected', 'withdrawn'].includes(a.trackStatus),
  ).length;
  const offers = byStatus.offer || 0;
  const interviews = byStatus.interview || 0;
  const responseRate = total
    ? Math.round(
      (applications.filter((a) => a.trackStatus !== 'applied').length / total) * 100,
    )
    : 0;

  const monthly = await Application.aggregate([
    { $match: { applicantId: uid } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  const avgDaysToUpdate = applications.length
    ? Math.round(
      applications.reduce((sum, a) => {
        const days = (a.updatedAt - a.createdAt) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / applications.length,
    )
    : 0;

  return {
    totalApplications: total,
    savedJobs: bookmarks,
    activeApplications: active,
    offers,
    interviews,
    responseRate,
    avgDaysInPipeline: avgDaysToUpdate,
    byStatus: TRACK_STATUSES.reduce((acc, s) => {
      acc[s] = byStatus[s] || 0;
      return acc;
    }, {}),
    applicationsOverTime: monthly.map((m) => ({ month: m._id, count: m.count })),
  };
};

export const getTrackingDetail = async (id, userId) => {
  const app = await assertStudentApplication(id, userId);
  const job = await Job.findById(app.jobId);
  return {
    application: app.toSafeObject(),
    job: job?.toSafeObject() || null,
  };
};

export const updateTrackStatus = async (id, userId, trackStatus, note = '') => {
  if (!TRACK_STATUSES.includes(trackStatus)) {
    throw new ApiError(400, 'Invalid track status');
  }

  const app = await assertStudentApplication(id, userId);
  if (app.trackStatus === trackStatus) return app.toSafeObject();

  app.trackStatus = trackStatus;
  pushTimeline(app, {
    status: trackStatus,
    title: `Moved to ${TRACK_STATUS_LABELS[trackStatus]}`,
    note: note || '',
  });

  if (trackStatus === 'withdrawn') {
    app.status = 'rejected';
  }

  await app.save();
  return app.toSafeObject();
};

export const addStudentNote = async (id, userId, text) => {
  const app = await assertStudentApplication(id, userId);
  app.studentNotes.push({ text: String(text).trim() });
  await app.save();
  return app.toSafeObject();
};

export const updateStudentNote = async (id, userId, noteId, text) => {
  const app = await assertStudentApplication(id, userId);
  const note = app.studentNotes.id(noteId);
  if (!note) throw new ApiError(404, 'Note not found');
  note.text = String(text).trim();
  await app.save();
  return app.toSafeObject();
};

export const deleteStudentNote = async (id, userId, noteId) => {
  const app = await assertStudentApplication(id, userId);
  const note = app.studentNotes.id(noteId);
  if (!note) throw new ApiError(404, 'Note not found');
  note.deleteOne();
  await app.save();
  return app.toSafeObject();
};

export const addAttachment = async (id, userId, { name, url, fileType, size }) => {
  const app = await assertStudentApplication(id, userId);
  app.attachments.push({
    name: String(name).trim(),
    url: String(url).trim(),
    fileType: fileType || '',
    size: size || null,
  });
  pushTimeline(app, {
    status: app.trackStatus,
    title: 'Attachment added',
    note: name,
  });
  await app.save();
  return app.toSafeObject();
};

export const addAttachmentFile = async (id, userId, file) => {
  const app = await assertStudentApplication(id, userId);
  const upload = await uploadResumeFile(file.buffer, {
    fileName: file.originalname,
    mimeType: file.mimetype,
    folder: 'application-attachments',
  });

  if (upload.skipped || !upload.url) {
    throw new ApiError(503, 'File upload is not configured. Add an attachment URL instead.');
  }

  app.attachments.push({
    name: file.originalname,
    url: upload.url,
    fileType: file.mimetype,
    size: file.size,
    publicId: upload.publicId,
  });
  pushTimeline(app, {
    status: app.trackStatus,
    title: 'File uploaded',
    note: file.originalname,
  });
  await app.save();
  return app.toSafeObject();
};

export const deleteAttachment = async (id, userId, attachmentId) => {
  const app = await assertStudentApplication(id, userId);
  const attachment = app.attachments.id(attachmentId);
  if (!attachment) throw new ApiError(404, 'Attachment not found');
  attachment.deleteOne();
  await app.save();
  return app.toSafeObject();
};

export const initializeApplicationTracking = (applicationDoc) => {
  applicationDoc.trackStatus = 'applied';
  applicationDoc.timeline = [{
    status: 'applied',
    title: 'Application submitted',
    note: `Applied to ${applicationDoc.jobTitle} at ${applicationDoc.companyName}`,
  }];
  return applicationDoc;
};
