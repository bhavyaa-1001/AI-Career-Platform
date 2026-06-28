import { Router } from 'express';

import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import healthRoutes from './healthRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import profileRoutes from './profileRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);

export default router;
