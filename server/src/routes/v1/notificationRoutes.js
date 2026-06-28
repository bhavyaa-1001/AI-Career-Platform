import { Router } from 'express';

import {
  getNotifications,
  readAllNotifications,
  readNotification,
} from '../../controllers/notificationController.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', getNotifications);
router.patch('/read-all', readAllNotifications);
router.patch('/:id/read', readNotification);

export default router;
