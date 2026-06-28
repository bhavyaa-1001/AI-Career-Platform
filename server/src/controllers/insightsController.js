import { getAdminInsights } from '../services/insights/adminInsightsService.js';
import { insightsToCsv, insightsToPdf } from '../services/insights/exportInsightsService.js';
import { getRecruiterInsights } from '../services/insights/recruiterInsightsService.js';
import { getStudentInsights } from '../services/insights/studentInsightsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const studentInsightsHandler = asyncHandler(async (req, res) => {
  const insights = await getStudentInsights(req.user._id, req.query);
  res.json({ success: true, data: { insights } });
});

export const recruiterInsightsHandler = asyncHandler(async (req, res) => {
  const insights = await getRecruiterInsights(req.user._id, req.query);
  res.json({ success: true, data: { insights } });
});

export const adminInsightsHandler = asyncHandler(async (req, res) => {
  const insights = await getAdminInsights(req.query);
  res.json({ success: true, data: { insights } });
});

export const exportStudentInsightsHandler = asyncHandler(async (req, res) => {
  const insights = await getStudentInsights(req.user._id, req.query);
  const format = req.query.format || 'csv';

  if (format === 'pdf') {
    const pdf = await insightsToPdf(insights, 'student', 'Student Analytics Report');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="student-analytics.pdf"');
    return res.send(pdf);
  }

  const csv = insightsToCsv(insights, 'student');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="student-analytics.csv"');
  return res.send(csv);
});

export const exportRecruiterInsightsHandler = asyncHandler(async (req, res) => {
  const insights = await getRecruiterInsights(req.user._id, req.query);
  const format = req.query.format || 'csv';

  if (format === 'pdf') {
    const pdf = await insightsToPdf(insights, 'recruiter', 'Recruiter Analytics Report');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="recruiter-analytics.pdf"');
    return res.send(pdf);
  }

  const csv = insightsToCsv(insights, 'recruiter');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="recruiter-analytics.csv"');
  return res.send(csv);
});

export const exportAdminInsightsHandler = asyncHandler(async (req, res) => {
  const insights = await getAdminInsights(req.query);
  const format = req.query.format || 'csv';

  if (format === 'pdf') {
    const pdf = await insightsToPdf(insights, 'admin', 'Admin Platform Analytics');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="admin-analytics.pdf"');
    return res.send(pdf);
  }

  const csv = insightsToCsv(insights, 'admin');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="admin-analytics.csv"');
  return res.send(csv);
});
