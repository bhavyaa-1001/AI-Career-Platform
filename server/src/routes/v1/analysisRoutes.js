import { Router } from 'express';

import {
  analysisStatusHandler,
  analyticsSummaryHandler,
  analyzeResumeHandler,
  analyzeUploadHandler,
  getAnalysisHandler,
  listAnalysesHandler,
} from '../../controllers/analysisController.js';
import { authenticate } from '../../middleware/auth.js';
import { handleMulterError, uploadResume } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import {
  analysisIdSchema,
  analyzeResumeSchema,
  analyzeUploadSchema,
  listAnalysesSchema,
} from '../../validators/analysisValidator.js';

const router = Router();

router.use(authenticate);

router.get('/status', analysisStatusHandler);
router.get('/analytics', analyticsSummaryHandler);
router.get('/', validate(listAnalysesSchema), listAnalysesHandler);
router.post('/upload', uploadResume.single('file'), handleMulterError, validate(analyzeUploadSchema), analyzeUploadHandler);
router.post('/resume/:resumeId', validate(analyzeResumeSchema), analyzeResumeHandler);
router.get('/:id', validate(analysisIdSchema), getAnalysisHandler);

export default router;
