import { InterviewRecord } from '../../models/admin/InterviewRecord.js';
import { InterviewTemplate } from '../../models/admin/InterviewTemplate.js';
import { QuestionBank } from '../../models/admin/QuestionBank.js';
import { ApiError } from '../../utils/ApiError.js';

import { logAdminAction } from './auditService.js';

const paginate = (page, limit, total) => ({
  page, limit, total, pages: Math.ceil(total / limit) || 1,
});

export const listInterviewRecords = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.userId) filter.userId = query.userId;
  if (query.type) filter.type = query.type;
  if (query.status) filter.status = query.status;

  const [records, total] = await Promise.all([
    InterviewRecord.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    InterviewRecord.countDocuments(filter),
  ]);

  return {
    records: records.map((r) => r.toSafeObject()),
    pagination: paginate(page, limit, total),
  };
};

export const deleteInterviewRecord = async (admin, recordId) => {
  const record = await InterviewRecord.findByIdAndDelete(recordId);
  if (!record) throw new ApiError(404, 'Interview record not found');

  await logAdminAction(admin, 'admin_action', `Deleted interview record ${recordId}`, {
    resource: 'interview', resourceId: recordId,
  });

  return { deleted: true };
};

export const listTemplates = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.category) filter.category = query.category;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  const [templates, total] = await Promise.all([
    InterviewTemplate.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    InterviewTemplate.countDocuments(filter),
  ]);

  return {
    templates: templates.map((t) => t.toSafeObject()),
    pagination: paginate(page, limit, total),
  };
};

export const createTemplate = async (admin, data) => {
  const template = await InterviewTemplate.create({ ...data, createdBy: admin._id });
  return template.toSafeObject();
};

export const updateTemplate = async (admin, templateId, data) => {
  const template = await InterviewTemplate.findByIdAndUpdate(templateId, data, { new: true });
  if (!template) throw new ApiError(404, 'Template not found');
  return template.toSafeObject();
};

export const deleteTemplate = async (admin, templateId) => {
  const template = await InterviewTemplate.findByIdAndDelete(templateId);
  if (!template) throw new ApiError(404, 'Template not found');
  return { deleted: true };
};

export const listQuestions = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.category) filter.category = query.category;
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.search) filter.question = new RegExp(query.search.trim(), 'i');

  const [questions, total] = await Promise.all([
    QuestionBank.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    QuestionBank.countDocuments(filter),
  ]);

  return {
    questions: questions.map((q) => q.toSafeObject()),
    pagination: paginate(page, limit, total),
  };
};

export const createQuestion = async (admin, data) => {
  const question = await QuestionBank.create({ ...data, createdBy: admin._id });
  return question.toSafeObject();
};

export const updateQuestion = async (admin, questionId, data) => {
  const question = await QuestionBank.findByIdAndUpdate(questionId, data, { new: true });
  if (!question) throw new ApiError(404, 'Question not found');
  return question.toSafeObject();
};

export const deleteQuestion = async (admin, questionId) => {
  const question = await QuestionBank.findByIdAndDelete(questionId);
  if (!question) throw new ApiError(404, 'Question not found');
  return { deleted: true };
};
