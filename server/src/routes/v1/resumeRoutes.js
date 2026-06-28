import { Router } from 'express';

import {
  autosaveResumeHandler,
  createResumeHandler,
  deleteResumeHandler,
  duplicateResumeHandler,
  exportPdfGetHandler,
  exportPdfPostHandler,
  getResume,
  getVersionHandler,
  importProfileHandler,
  listResumes,
  listVersionsHandler,
  parseImportHandler,
  restoreVersionHandler,
  saveImportHandler,
  updateResumeHandler,
} from '../../controllers/resumeController.js';
import { authenticate } from '../../middleware/auth.js';
import { handleMulterError, uploadResume } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import {
  autosaveResumeSchema,
  createResumeSchema,
  exportPdfSchema,
  importProfileSchema,
  importSaveSchema,
  resumeIdSchema,
  updateResumeSchema,
  versionIdSchema,
} from '../../validators/resumeValidator.js';

const router = Router();

router.use(authenticate);

router.get('/', listResumes);
router.post('/', validate(createResumeSchema), createResumeHandler);
router.post('/import/parse', uploadResume.single('file'), handleMulterError, parseImportHandler);
router.post('/import/save', validate(importSaveSchema), saveImportHandler);
router.post('/import-profile', validate(importProfileSchema), importProfileHandler);
router.get('/:id/pdf', validate(resumeIdSchema), exportPdfGetHandler);
router.post('/:id/pdf', validate(exportPdfSchema), exportPdfPostHandler);
router.get('/:id', validate(resumeIdSchema), getResume);
router.put('/:id', validate(updateResumeSchema), updateResumeHandler);
router.patch('/:id/autosave', validate(autosaveResumeSchema), autosaveResumeHandler);
router.delete('/:id', validate(resumeIdSchema), deleteResumeHandler);
router.post('/:id/duplicate', validate(resumeIdSchema), duplicateResumeHandler);
router.get('/:id/versions', validate(resumeIdSchema), listVersionsHandler);
router.get('/:id/versions/:versionId', validate(versionIdSchema), getVersionHandler);
router.post('/:id/restore/:versionId', validate(versionIdSchema), restoreVersionHandler);

export default router;
