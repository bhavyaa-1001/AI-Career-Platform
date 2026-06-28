import { CoverLetter } from '../models/CoverLetter.js';
import { ApiError } from '../utils/ApiError.js';
import { renderCoverLetterHtml } from '../utils/coverLetterHtmlRenderer.js';
import { resumeToPlainText } from '../utils/resumePlainText.js';

import { logActivity } from './activityService.js';
import { generateCoverLetterText } from './geminiCoverLetterService.js';
import { generatePdfBuffer } from './resumePdfService.js';
import { getResumeById } from './resumeService.js';

export const createCoverLetter = async (userId, data) => {
  const resume = await getResumeById(data.resumeId, userId);
  const resumeText = resumeToPlainText(resume);
  const applicantName = resume.content?.personalInfo?.fullName || '';

  if (resumeText.length < 30) {
    throw new ApiError(422, 'Selected resume has too little content. Add more details first.');
  }

  const generated = await generateCoverLetterText({
    resumeText,
    jobDescription: data.jobDescription,
    company: data.company,
    role: data.role,
    tone: data.tone,
    length: data.length,
    applicantName,
  });

  const doc = await CoverLetter.create({
    userId,
    resumeId: resume.id,
    resumeTitle: resume.title,
    company: data.company,
    role: data.role,
    jobDescription: data.jobDescription,
    tone: data.tone,
    length: data.length,
    body: generated.body,
    model: generated.model,
    wordCount: generated.wordCount,
  });

  await logActivity(userId, 'profile_update', `Generated cover letter: ${data.role} at ${data.company}`, {
    coverLetterId: doc._id.toString(),
    resumeId: resume.id,
  });

  return doc.toSafeObject();
};

export const listCoverLetters = async (userId, { limit = 30, page = 1 } = {}) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    CoverLetter.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    CoverLetter.countDocuments({ userId }),
  ]);
  return {
    coverLetters: items.map((c) => c.toSafeObject()),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const getCoverLetterById = async (id, userId) => {
  const letter = await CoverLetter.findOne({ _id: id, userId });
  if (!letter) throw new ApiError(404, 'Cover letter not found');
  return letter.toSafeObject();
};

export const updateCoverLetter = async (id, userId, { body }) => {
  const letter = await CoverLetter.findOne({ _id: id, userId });
  if (!letter) throw new ApiError(404, 'Cover letter not found');

  letter.body = String(body || '').slice(0, 12000);
  letter.wordCount = letter.body.trim().split(/\s+/).filter(Boolean).length;
  await letter.save();

  return letter.toSafeObject();
};

export const deleteCoverLetter = async (id, userId) => {
  const letter = await CoverLetter.findOne({ _id: id, userId });
  if (!letter) throw new ApiError(404, 'Cover letter not found');
  await letter.deleteOne();
};

export const exportCoverLetterPdf = async (id, userId) => {
  const letter = await CoverLetter.findOne({ _id: id, userId });
  if (!letter) throw new ApiError(404, 'Cover letter not found');

  let applicantName = '';
  if (letter.resumeId) {
    try {
      const resume = await getResumeById(letter.resumeId.toString(), userId);
      applicantName = resume.content?.personalInfo?.fullName || '';
    } catch {
      /* optional */
    }
  }

  const html = renderCoverLetterHtml({
    body: letter.body,
    company: letter.company,
    role: letter.role,
    applicantName,
  });
  const buffer = await generatePdfBuffer(html);
  const safeCompany = letter.company.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'Company';
  const filename = `Cover-Letter-${safeCompany}.pdf`;

  return { buffer, filename };
};
