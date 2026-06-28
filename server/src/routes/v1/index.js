import { Router } from 'express';

import { withUsageLimit } from '../../middleware/usageEnforcement.js';

import adminRoutes from './adminRoutes.js';
import adminSaasRoutes from './adminSaasRoutes.js';
import analysisRoutes from './analysisRoutes.js';
import authRoutes from './authRoutes.js';
import codingRoutes from './codingRoutes.js';
import coverLetterRoutes from './coverLetterRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import healthRoutes from './healthRoutes.js';
import insightsRoutes from './insightsRoutes.js';
import jobRoutes from './jobRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import profileRoutes from './profileRoutes.js';
import resumeMatchRoutes from './resumeMatchRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import saasRoutes from './saasRoutes.js';
import templateRoutes from './templateRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/saas', adminSaasRoutes);
router.use('/billing', saasRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/resumes', ...withUsageLimit('resumeCount', { increment: true }), resumeRoutes);
router.use('/resume-match', ...withUsageLimit('aiCredits', { increment: true }), resumeMatchRoutes);
router.use('/analysis', ...withUsageLimit('aiCredits', { increment: true }), analysisRoutes);
router.use('/coding', ...withUsageLimit('codingSubmissions', { increment: true }), codingRoutes);
router.use('/cover-letters', ...withUsageLimit('aiCredits', { increment: true }), coverLetterRoutes);
router.use('/insights', insightsRoutes);
router.use('/jobs', ...withUsageLimit('jobApplications', { increment: true }), jobRoutes);
router.use('/templates', templateRoutes);

export default router;
