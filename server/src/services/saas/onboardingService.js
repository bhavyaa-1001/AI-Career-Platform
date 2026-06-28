import { getOrCreateBillingAccount } from './billingAccountService.js';
import { sendBillingEmail } from './billingEmailService.js';
import { registerReferral } from './referralCouponService.js';
import { getOrCreatePreferences } from './userSettingsService.js';
import { getOrCreateSecurity } from './userSettingsService.js';

export const initializeSaasUser = async (userId, { referralCode } = {}) => {
  await Promise.all([
    getOrCreateBillingAccount(userId),
    getOrCreatePreferences(userId),
    getOrCreateSecurity(userId),
  ]);

  if (referralCode) {
    await registerReferral(userId, referralCode);
  }

  await sendBillingEmail(userId, 'welcome');
  return { initialized: true };
};
