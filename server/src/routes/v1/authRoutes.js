import { Router } from 'express';

import {
  changePasswordHandler,
  forgotPasswordHandler,
  getMe,
  login,
  logout,
  logoutAll,
  refreshToken,
  register,
  resendVerification,
  resetPasswordHandler,
  updateProfile,
  uploadAvatar,
  verifyEmailToken,
} from '../../controllers/authController.js';
import { authenticate, optionalAuth } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { handleMulterError, uploadAvatar as uploadAvatarMiddleware } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
} from '../../validators/authValidator.js';

const router = Router();

router.use(authLimiter);

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', optionalAuth, logout);
router.post('/logout-all', authenticate, logoutAll);

router.get('/verify-email/:token', validate(verifyEmailSchema), verifyEmailToken);
router.post('/resend-verification', authenticate, resendVerification);

router.post('/forgot-password', validate(forgotPasswordSchema), forgotPasswordHandler);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPasswordHandler);

router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.patch('/change-password', authenticate, validate(changePasswordSchema), changePasswordHandler);
router.post(
  '/profile/avatar',
  authenticate,
  uploadAvatarMiddleware.single('avatar'),
  handleMulterError,
  uploadAvatar,
);

export default router;
