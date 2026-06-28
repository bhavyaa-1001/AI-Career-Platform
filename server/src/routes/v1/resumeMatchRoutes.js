import { Router } from 'express';

import {
  deleteMatchHandler,
  generateMatchHandler,
  getMatchHandler,
  listMatchesHandler,
  matchDashboardHandler,
  matchStatusHandler,
} from '../../controllers/resumeMatchController.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  generateMatchSchema,
  listMatchesSchema,
  matchIdSchema,
} from '../../validators/resumeMatchValidator.js';

const router = Router();

router.use(authenticate);

router.get('/status', matchStatusHandler);
router.get('/dashboard', matchDashboardHandler);
router.get('/', validate(listMatchesSchema), listMatchesHandler);
router.post('/generate', validate(generateMatchSchema), generateMatchHandler);
router.get('/:id', validate(matchIdSchema), getMatchHandler);
router.delete('/:id', validate(matchIdSchema), deleteMatchHandler);

export default router;
