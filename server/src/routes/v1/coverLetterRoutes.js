import { Router } from 'express';

import {
  coverLetterStatusHandler,
  deleteCoverLetterHandler,
  exportCoverLetterPdfHandler,
  generateCoverLetterHandler,
  getCoverLetterHandler,
  listCoverLettersHandler,
  updateCoverLetterHandler,
} from '../../controllers/coverLetterController.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  coverLetterIdSchema,
  generateCoverLetterSchema,
  listCoverLettersSchema,
  updateCoverLetterSchema,
} from '../../validators/coverLetterValidator.js';

const router = Router();

router.use(authenticate);

router.get('/status', coverLetterStatusHandler);
router.get('/', validate(listCoverLettersSchema), listCoverLettersHandler);
router.post('/generate', validate(generateCoverLetterSchema), generateCoverLetterHandler);
router.get('/:id/pdf', validate(coverLetterIdSchema), exportCoverLetterPdfHandler);
router.get('/:id', validate(coverLetterIdSchema), getCoverLetterHandler);
router.put('/:id', validate(updateCoverLetterSchema), updateCoverLetterHandler);
router.delete('/:id', validate(coverLetterIdSchema), deleteCoverLetterHandler);

export default router;
