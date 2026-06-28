import { Router } from 'express';

import {
  billingOverviewHandler,
  listPlansHandler,
  stripeStatusHandler,
  checkoutHandler,
  confirmCheckoutHandler,
  portalHandler,
  cancelSubscriptionHandler,
  paymentHistoryHandler,
  invoicesHandler,
  usageHandler,
  validateCouponHandler,
  redeemCouponHandler,
  referralDashboardHandler,
  applyReferralHandler,
  createOrgHandler,
  myOrgsHandler,
  inviteMemberHandler,
  listMembersHandler,
  getPreferencesHandler,
  updatePreferencesHandler,
  securityOverviewHandler,
  setup2faHandler,
  enable2faHandler,
  disable2faHandler,
  getBillingAddressHandler,
  updateBillingAddressHandler,
  exportDataHandler,
  deleteAccountHandler,
  revokeSessionHandler,
  trustDeviceHandler,
  developerDashboardHandler,
  createApiKeyHandler,
  listApiKeysHandler,
  revokeApiKeyHandler,
  createWebhookHandler,
  listWebhooksHandler,
  deleteWebhookHandler,
  webhookLogsHandler,
} from '../../controllers/saasController.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  checkoutSchema,
  confirmCheckoutSchema,
  cancelSubscriptionSchema,
  validateCouponSchema,
  referralCodeSchema,
  preferencesSchema,
  billingAddressSchema,
  twoFactorTokenSchema,
  deleteAccountSchema,
  revokeSessionSchema,
  createApiKeySchema,
  createWebhookSchema,
  createOrganizationSchema,
  inviteMemberSchema,
  orgIdParamSchema,
  idParamSchema,
  paginationSchema,
} from '../../validators/saasValidator.js';

const router = Router();

router.get('/plans', listPlansHandler);
router.get('/stripe/status', stripeStatusHandler);

router.use(authenticate);

router.get('/overview', billingOverviewHandler);
router.get('/usage', usageHandler);
router.post('/checkout', validate(checkoutSchema), checkoutHandler);
router.post('/checkout/confirm', validate(confirmCheckoutSchema), confirmCheckoutHandler);
router.post('/portal', portalHandler);
router.post('/cancel', validate(cancelSubscriptionSchema), cancelSubscriptionHandler);
router.get('/payments', validate(paginationSchema), paymentHistoryHandler);
router.get('/invoices', validate(paginationSchema), invoicesHandler);

router.post('/coupons/validate', validate(validateCouponSchema), validateCouponHandler);
router.post('/coupons/redeem', validate(referralCodeSchema), redeemCouponHandler);

router.get('/referrals', referralDashboardHandler);
router.post('/referrals/apply', validate(referralCodeSchema), applyReferralHandler);

router.get('/organizations', myOrgsHandler);
router.post('/organizations', validate(createOrganizationSchema), createOrgHandler);
router.post('/organizations/:orgId/invite', validate(inviteMemberSchema), inviteMemberHandler);
router.get('/organizations/:orgId/members', validate(orgIdParamSchema), listMembersHandler);

router.get('/settings/preferences', getPreferencesHandler);
router.patch('/settings/preferences', validate(preferencesSchema), updatePreferencesHandler);
router.get('/settings/security', securityOverviewHandler);
router.post('/settings/security/2fa/setup', setup2faHandler);
router.post('/settings/security/2fa/enable', validate(twoFactorTokenSchema), enable2faHandler);
router.post('/settings/security/2fa/disable', disable2faHandler);
router.delete('/settings/security/sessions/:sessionId', validate(revokeSessionSchema), revokeSessionHandler);
router.post('/settings/security/trust-device', trustDeviceHandler);
router.get('/settings/billing-address', getBillingAddressHandler);
router.put('/settings/billing-address', validate(billingAddressSchema), updateBillingAddressHandler);
router.post('/settings/export-data', exportDataHandler);
router.post('/settings/delete-account', validate(deleteAccountSchema), deleteAccountHandler);

router.get('/developer', developerDashboardHandler);
router.get('/developer/keys', listApiKeysHandler);
router.post('/developer/keys', validate(createApiKeySchema), createApiKeyHandler);
router.delete('/developer/keys/:id', validate(idParamSchema), revokeApiKeyHandler);
router.get('/developer/webhooks', listWebhooksHandler);
router.post('/developer/webhooks', validate(createWebhookSchema), createWebhookHandler);
router.delete('/developer/webhooks/:id', validate(idParamSchema), deleteWebhookHandler);
router.get('/developer/webhooks/:id/logs', validate(idParamSchema), webhookLogsHandler);

export default router;
