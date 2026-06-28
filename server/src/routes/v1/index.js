import { Router } from 'express';

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
import templateRoutes from './templateRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/resumes', resumeRoutes);
router.use('/resume-match', resumeMatchRoutes);
router.use('/analysis', analysisRoutes);
router.use('/coding', codingRoutes);
router.use('/cover-letters', coverLetterRoutes);
router.use('/insights', insightsRoutes);
router.use('/jobs', jobRoutes);
router.use('/templates', templateRoutes);

export default router;
