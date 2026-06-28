import { Router } from 'express';

import {
  adminRevenueHandler,
  adminPlansHandler,
  adminUpdatePlanHandler,
  adminCouponsHandler,
  adminCreateCouponHandler,
  adminSubscriptionsHandler,
  adminRefundHandler,
  adminPaymentsHandler,
  adminReferralsHandler,
} from '../../controllers/saasController.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  createCouponSchema,
  updatePlanSchema,
  refundSchema,
  paginationSchema,
} from '../../validators/saasValidator.js';

const router = Router();

router.use(authenticate, authorize('admin', 'sub_admin'));

router.get('/revenue', adminRevenueHandler);
router.get('/plans', adminPlansHandler);
router.patch('/plans/:id', validate(updatePlanSchema), adminUpdatePlanHandler);
router.get('/coupons', adminCouponsHandler);
router.post('/coupons', validate(createCouponSchema), adminCreateCouponHandler);
router.get('/subscriptions', validate(paginationSchema), adminSubscriptionsHandler);
router.get('/payments', validate(paginationSchema), adminPaymentsHandler);
router.post('/payments/:id/refund', validate(refundSchema), adminRefundHandler);
router.get('/referrals', validate(paginationSchema), adminReferralsHandler);

export default router;
