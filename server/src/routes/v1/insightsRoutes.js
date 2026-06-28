import { Router } from 'express';

import {
  adminInsightsHandler,
  exportAdminInsightsHandler,
  exportRecruiterInsightsHandler,
  exportStudentInsightsHandler,
  recruiterInsightsHandler,
  studentInsightsHandler,
} from '../../controllers/insightsController.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { exportQuerySchema, insightsQuerySchema } from '../../validators/insightsValidator.js';

const router = Router();

router.use(authenticate);

router.get('/student', authorize('student'), validate(insightsQuerySchema), studentInsightsHandler);
router.get('/student/export', authorize('student'), validate(exportQuerySchema), exportStudentInsightsHandler);

router.get('/recruiter', authorize('recruiter'), validate(insightsQuerySchema), recruiterInsightsHandler);
router.get('/recruiter/export', authorize('recruiter'), validate(exportQuerySchema), exportRecruiterInsightsHandler);

router.get('/admin', authorize('admin'), validate(insightsQuerySchema), adminInsightsHandler);
router.get('/admin/export', authorize('admin'), validate(exportQuerySchema), exportAdminInsightsHandler);

export default router;
