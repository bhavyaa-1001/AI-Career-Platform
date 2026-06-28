import mongoose from 'mongoose';

export const APPLICATION_STATUSES = ['pending', 'shortlisted', 'rejected', 'accepted'];
export const TRACK_STATUSES = ['applied', 'assessment', 'interview', 'offer', 'rejected', 'withdrawn'];
export const KANBAN_COLUMNS = ['saved', ...TRACK_STATUSES];

const timelineItem = new mongoose.Schema(
  {
    status: { type: String, enum: TRACK_STATUSES, required: true },
    title: { type: String, maxlength: 120, required: true },
    note: { type: String, maxlength: 500, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const studentNote = new mongoose.Schema(
  {
    text: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true },
);

const attachmentItem = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    url: { type: String, required: true, maxlength: 500 },
    fileType: { type: String, maxlength: 80, default: '' },
    size: { type: Number, default: null },
    publicId: { type: String, maxlength: 200, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    applicantName: { type: String, default: '' },
    applicantEmail: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    companyName: { type: String, default: '' },
    coverLetter: { type: String, maxlength: 8000, default: '' },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'pending',
      index: true,
    },
    trackStatus: {
      type: String,
      enum: TRACK_STATUSES,
      default: 'applied',
      index: true,
    },
    timeline: { type: [timelineItem], default: [] },
    studentNotes: { type: [studentNote], default: [] },
    attachments: { type: [attachmentItem], default: [] },
    rankingScore: { type: Number, min: 0, max: 100, default: null },
    rankingSummary: { type: String, maxlength: 500, default: '' },
    rankingStrengths: { type: [String], default: [] },
    rankingGaps: { type: [String], default: [] },
    notes: { type: String, maxlength: 2000, default: '' },
    rankedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
applicationSchema.index({ recruiterId: 1, createdAt: -1 });
applicationSchema.index({ applicantId: 1, trackStatus: 1 });
applicationSchema.index({ jobId: 1, rankingScore: -1 });

const mapSubdocs = (items) =>
  items.map((item) => {
    const obj = item.toObject ? item.toObject() : item;
    return {
      id: obj._id?.toString(),
      ...obj,
      _id: undefined,
    };
  });

applicationSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    jobId: this.jobId.toString(),
    recruiterId: this.recruiterId.toString(),
    applicantId: this.applicantId.toString(),
    resumeId: this.resumeId.toString(),
    applicantName: this.applicantName,
    applicantEmail: this.applicantEmail,
    jobTitle: this.jobTitle,
    companyName: this.companyName,
    coverLetter: this.coverLetter,
    status: this.status,
    trackStatus: this.trackStatus,
    timeline: mapSubdocs(this.timeline || []),
    studentNotes: mapSubdocs(this.studentNotes || []),
    attachments: mapSubdocs(this.attachments || []),
    rankingScore: this.rankingScore,
    rankingSummary: this.rankingSummary,
    rankingStrengths: this.rankingStrengths,
    rankingGaps: this.rankingGaps,
    notes: this.notes,
    rankedAt: this.rankedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Application = mongoose.model('Application', applicationSchema);

export const mapRecruiterStatusToTrack = (recruiterStatus) => {
  switch (recruiterStatus) {
    case 'shortlisted': return 'interview';
    case 'accepted': return 'offer';
    case 'rejected': return 'rejected';
    default: return null;
  }
};

export const TRACK_STATUS_LABELS = {
  applied: 'Applied',
  assessment: 'Assessment',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};
