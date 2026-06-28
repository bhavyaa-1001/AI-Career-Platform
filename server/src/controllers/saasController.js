import {
  getSaasRevenueDashboard,
  adminListPlans,
  adminUpdatePlan,
  adminProcessRefund,
  adminListSubscriptions,
} from '../services/saas/adminSaasService.js';
import { getBillingOverview } from '../services/saas/billingAccountService.js';
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  createWebhook,
  listWebhooks,
  deleteWebhook,
  listWebhookLogs,
  getDeveloperDashboard,
} from '../services/saas/developerService.js';
import {
  createOrganization,
  getMyOrganizations,
  inviteMember,
  listMembers,
} from '../services/saas/organizationService.js';
import {
  getReferralDashboard,
  registerReferral,
  validateCoupon,
  redeemCoupon,
  listCoupons,
  createCoupon,
} from '../services/saas/referralCouponService.js';
import {
  cancelSubscription,
  confirmCheckoutSession,
  createCheckoutSession,
  createPortalSession,
  getInvoices,
  getPaymentHistory,
  getStripeStatus,
} from '../services/saas/stripeService.js';
import { getUsageSummary, listPlans } from '../services/saas/usageService.js';
import {
  getOrCreatePreferences,
  updatePreferences,
  getSecurityOverview,
  setupTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  updateBillingAddress,
  getBillingAddress,
  requestDataExport,
  requestAccountDeletion,
  revokeSession,
  trustDevice,
} from '../services/saas/userSettingsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Billing
export const billingOverviewHandler = asyncHandler(async (req, res) => {
  const overview = await getBillingOverview(req.user._id);
  res.json({ success: true, data: overview });
});

export const listPlansHandler = asyncHandler(async (_req, res) => {
  const plans = await listPlans();
  res.json({ success: true, data: { plans } });
});

export const stripeStatusHandler = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: getStripeStatus() });
});

export const checkoutHandler = asyncHandler(async (req, res) => {
  const session = await createCheckoutSession(req.user, req.body);
  res.json({ success: true, data: session });
});

export const confirmCheckoutHandler = asyncHandler(async (req, res) => {
  const result = await confirmCheckoutSession(req.user, req.body.sessionId);
  res.json({ success: true, data: result });
});

export const portalHandler = asyncHandler(async (req, res) => {
  const session = await createPortalSession(req.user);
  res.json({ success: true, data: session });
});

export const cancelSubscriptionHandler = asyncHandler(async (req, res) => {
  const subscription = await cancelSubscription(req.user, req.body);
  res.json({ success: true, data: { subscription } });
});

export const paymentHistoryHandler = asyncHandler(async (req, res) => {
  const result = await getPaymentHistory(req.user._id, req.query);
  res.json({ success: true, data: result });
});

export const invoicesHandler = asyncHandler(async (req, res) => {
  const result = await getInvoices(req.user._id, req.query);
  res.json({ success: true, data: result });
});

export const usageHandler = asyncHandler(async (req, res) => {
  const usage = await getUsageSummary(req.user._id);
  res.json({ success: true, data: usage });
});

// Coupons & Referrals
export const validateCouponHandler = asyncHandler(async (req, res) => {
  const coupon = await validateCoupon(req.body.code, req.user._id, req.body.planSlug);
  res.json({ success: true, data: { coupon } });
});

export const redeemCouponHandler = asyncHandler(async (req, res) => {
  const coupon = await redeemCoupon(req.user._id, req.body.code);
  res.json({ success: true, data: { coupon } });
});

export const referralDashboardHandler = asyncHandler(async (req, res) => {
  const dashboard = await getReferralDashboard(req.user._id);
  res.json({ success: true, data: dashboard });
});

export const applyReferralHandler = asyncHandler(async (req, res) => {
  const result = await registerReferral(req.user._id, req.body.code);
  res.json({ success: true, data: result });
});

// Organizations
export const createOrgHandler = asyncHandler(async (req, res) => {
  const org = await createOrganization(req.user._id, req.body);
  res.status(201).json({ success: true, data: { organization: org } });
});

export const myOrgsHandler = asyncHandler(async (req, res) => {
  const orgs = await getMyOrganizations(req.user._id);
  res.json({ success: true, data: { organizations: orgs } });
});

export const inviteMemberHandler = asyncHandler(async (req, res) => {
  const invite = await inviteMember(req.user._id, req.params.orgId, req.body);
  res.status(201).json({ success: true, data: { invite } });
});

export const listMembersHandler = asyncHandler(async (req, res) => {
  const members = await listMembers(req.user._id, req.params.orgId);
  res.json({ success: true, data: { members } });
});

// Settings
export const getPreferencesHandler = asyncHandler(async (req, res) => {
  const prefs = await getOrCreatePreferences(req.user._id);
  res.json({ success: true, data: { preferences: prefs.toSafeObject() } });
});

export const updatePreferencesHandler = asyncHandler(async (req, res) => {
  const preferences = await updatePreferences(req.user._id, req.body);
  res.json({ success: true, data: { preferences } });
});

export const securityOverviewHandler = asyncHandler(async (req, res) => {
  const overview = await getSecurityOverview(req.user._id);
  res.json({ success: true, data: overview });
});

export const setup2faHandler = asyncHandler(async (req, res) => {
  const result = await setupTwoFactor(req.user._id);
  res.json({ success: true, data: result });
});

export const enable2faHandler = asyncHandler(async (req, res) => {
  const security = await enableTwoFactor(req.user._id, req.body.token);
  res.json({ success: true, data: { security } });
});

export const disable2faHandler = asyncHandler(async (req, res) => {
  const security = await disableTwoFactor(req.user._id);
  res.json({ success: true, data: { security } });
});

export const getBillingAddressHandler = asyncHandler(async (req, res) => {
  const address = await getBillingAddress(req.user._id);
  res.json({ success: true, data: { address } });
});

export const updateBillingAddressHandler = asyncHandler(async (req, res) => {
  const address = await updateBillingAddress(req.user._id, req.body);
  res.json({ success: true, data: { address } });
});

export const exportDataHandler = asyncHandler(async (req, res) => {
  const result = await requestDataExport(req.user._id);
  res.json({ success: true, data: result });
});

export const deleteAccountHandler = asyncHandler(async (req, res) => {
  const result = await requestAccountDeletion(req.user._id, req.body.password);
  res.json({ success: true, data: result });
});

export const revokeSessionHandler = asyncHandler(async (req, res) => {
  const result = await revokeSession(req.user._id, req.params.sessionId);
  res.json({ success: true, data: result });
});

export const trustDeviceHandler = asyncHandler(async (req, res) => {
  const devices = await trustDevice(req.user._id, {
    deviceId: req.body.deviceId || req.headers['x-device-id'] || 'unknown',
    name: req.body.name || 'Browser',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  res.json({ success: true, data: { devices } });
});

// Developer
export const developerDashboardHandler = asyncHandler(async (req, res) => {
  const dashboard = await getDeveloperDashboard(req.user._id);
  res.json({ success: true, data: dashboard });
});

export const createApiKeyHandler = asyncHandler(async (req, res) => {
  const result = await createApiKey(req.user._id, req.body);
  res.status(201).json({ success: true, data: result });
});

export const listApiKeysHandler = asyncHandler(async (req, res) => {
  const keys = await listApiKeys(req.user._id);
  res.json({ success: true, data: { keys } });
});

export const revokeApiKeyHandler = asyncHandler(async (req, res) => {
  const key = await revokeApiKey(req.user._id, req.params.id);
  res.json({ success: true, data: { key } });
});

export const createWebhookHandler = asyncHandler(async (req, res) => {
  const result = await createWebhook(req.user._id, req.body);
  res.status(201).json({ success: true, data: result });
});

export const listWebhooksHandler = asyncHandler(async (req, res) => {
  const webhooks = await listWebhooks(req.user._id);
  res.json({ success: true, data: { webhooks } });
});

export const deleteWebhookHandler = asyncHandler(async (req, res) => {
  const result = await deleteWebhook(req.user._id, req.params.id);
  res.json({ success: true, data: result });
});

export const webhookLogsHandler = asyncHandler(async (req, res) => {
  const logs = await listWebhookLogs(req.user._id, req.params.id, req.query);
  res.json({ success: true, data: { logs } });
});

// Admin SaaS
export const adminRevenueHandler = asyncHandler(async (req, res) => {
  const dashboard = await getSaasRevenueDashboard(req.query);
  res.json({ success: true, data: { dashboard } });
});

export const adminPlansHandler = asyncHandler(async (_req, res) => {
  const plans = await adminListPlans();
  res.json({ success: true, data: { plans } });
});

export const adminUpdatePlanHandler = asyncHandler(async (req, res) => {
  const plan = await adminUpdatePlan(req.params.id, req.body);
  res.json({ success: true, data: { plan } });
});

export const adminCouponsHandler = asyncHandler(async (req, res) => {
  const coupons = await listCoupons(req.query);
  res.json({ success: true, data: { coupons } });
});

export const adminCreateCouponHandler = asyncHandler(async (req, res) => {
  const coupon = await createCoupon(req.user, req.body);
  res.status(201).json({ success: true, data: { coupon } });
});

export const adminSubscriptionsHandler = asyncHandler(async (req, res) => {
  const result = await adminListSubscriptions(req.query);
  res.json({ success: true, data: result });
});

export const adminRefundHandler = asyncHandler(async (req, res) => {
  const refund = await adminProcessRefund(req.user, req.params.id, req.body);
  res.json({ success: true, data: { refund } });
});

export const adminPaymentsHandler = asyncHandler(async (req, res) => {
  const { Payment } = await import('../models/saas/Payment.js');
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const [payments, total] = await Promise.all([
    Payment.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Payment.countDocuments({}),
  ]);
  res.json({
    success: true,
    data: {
      payments: payments.map((p) => p.toSafeObject()),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    },
  });
});

export const adminReferralsHandler = asyncHandler(async (req, res) => {
  const { Referral } = await import('../models/saas/Referral.js');
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const [referrals, total] = await Promise.all([
    Referral.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Referral.countDocuments({}),
  ]);
  res.json({
    success: true,
    data: {
      referrals: referrals.map((r) => r.toSafeObject()),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    },
  });
});
