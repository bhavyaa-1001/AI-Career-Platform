import { ResumeAnalysis } from '../models/ResumeAnalysis.js';
import { ApiError } from '../utils/ApiError.js';
import { resumeToPlainText } from '../utils/resumePlainText.js';

import { logActivity } from './activityService.js';
import { analyzeResumeText } from './geminiService.js';
import { extractTextFromFile } from './resumeParserService.js';
import { getResumeById } from './resumeService.js';

const persistAnalysis = async (userId, meta, result, error = null) => {
  const doc = await ResumeAnalysis.create({
    userId,
    resumeId: meta.resumeId || null,
    sourceType: meta.sourceType,
    sourceFileName: meta.sourceFileName || null,
    sourceFileType: meta.sourceFileType || null,
    resumeTitle: meta.resumeTitle || null,
    targetRole: meta.targetRole || null,
    targetJobDescription: meta.targetJobDescription || null,
    rawTextLength: meta.rawTextLength || 0,
    status: error ? 'failed' : 'completed',
    atsScore: result?.atsScore || 0,
    grammar: result?.grammar || { score: 0, issues: [] },
    missingSkills: result?.missingSkills || [],
    weakBulletPoints: result?.weakBulletPoints || [],
    keywordSuggestions: result?.keywordSuggestions || [],
    resumeSummary: result?.resumeSummary || '',
    improvementTips: result?.improvementTips || [],
    model: result?.model || null,
    durationMs: result?.durationMs || 0,
    error,
  });

  if (!error) {
    const label = meta.resumeTitle || meta.sourceFileName || 'Resume';
    await logActivity(userId, 'resume_analysis', `AI analyzed: ${label}`, {
      analysisId: doc._id.toString(),
      resumeId: meta.resumeId || null,
      atsScore: result.atsScore,
      grammarScore: result.grammar.score,
    });
  }

  return doc.toSafeObject();
};

export const analyzeUploadedResume = async (userId, file, options = {}) => {
  const { text, fileType } = await extractTextFromFile(file);
  const { targetRole, targetJobDescription } = options;

  const result = await analyzeResumeText({ resumeText: text, targetRole, targetJobDescription });
  return persistAnalysis(
    userId,
    {
      sourceType: 'upload',
      sourceFileName: file.originalname,
      sourceFileType: fileType,
      targetRole,
      targetJobDescription,
      rawTextLength: text.length,
    },
    result,
  );
};

export const analyzeExistingResume = async (resumeId, userId, options = {}) => {
  const resume = await getResumeById(resumeId, userId);
  const text = resumeToPlainText(resume);
  const { targetRole, targetJobDescription } = options;

  if (text.length < 50) {
    throw new ApiError(422, 'Resume has too little content to analyze. Add more sections first.');
  }

  const result = await analyzeResumeText({ resumeText: text, targetRole, targetJobDescription });
  return persistAnalysis(
    userId,
    {
      resumeId,
      sourceType: 'resume',
      resumeTitle: resume.title,
      targetRole,
      targetJobDescription,
      rawTextLength: text.length,
    },
    result,
  );
};

export const listAnalyses = async (userId, { limit = 20, page = 1 } = {}) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    ResumeAnalysis.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ResumeAnalysis.countDocuments({ userId }),
  ]);

  return {
    analyses: items.map((a) => a.toSafeObject()),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const getAnalysisById = async (analysisId, userId) => {
  const analysis = await ResumeAnalysis.findOne({ _id: analysisId, userId });
  if (!analysis) throw new ApiError(404, 'Analysis not found');
  return analysis.toSafeObject();
};

export const getAnalyticsSummary = async (userId) => {
  const analyses = await ResumeAnalysis.find({ userId, status: 'completed' }).sort({ createdAt: -1 });

  const total = analyses.length;
  const avgAts = total ? Math.round(analyses.reduce((s, a) => s + a.atsScore, 0) / total) : 0;
  const avgGrammar = total ? Math.round(analyses.reduce((s, a) => s + (a.grammar?.score || 0), 0) / total) : 0;

  const skillCounts = {};
  analyses.forEach((a) => {
    (a.missingSkills || []).forEach((skill) => {
      const key = skill.toLowerCase();
      skillCounts[key] = (skillCounts[key] || 0) + 1;
    });
  });

  const topMissingSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  const scoreHistory = analyses.slice(0, 12).reverse().map((a) => ({
    id: a._id.toString(),
    label: a.resumeTitle || a.sourceFileName || 'Analysis',
    atsScore: a.atsScore,
    grammarScore: a.grammar?.score || 0,
    createdAt: a.createdAt,
  }));

  const recent = analyses.slice(0, 5).map((a) => a.toSafeObject());

  const lastAnalysis = analyses[0]?.toSafeObject() || null;

  return {
    totalAnalyses: total,
    avgAtsScore: avgAts,
    avgGrammarScore: avgGrammar,
    topMissingSkills,
    scoreHistory,
    recentAnalyses: recent,
    lastAnalysis,
  };
};
