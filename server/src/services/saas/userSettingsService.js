import bcrypt from 'bcryptjs';

import { User } from '../../models/User.js';
import { LoginHistory } from '../../models/admin/LoginHistory.js';
import { BillingAddress } from '../../models/saas/BillingAddress.js';
import { UserPreferences } from '../../models/saas/UserPreferences.js';
import { UserSecurity } from '../../models/saas/UserSecurity.js';
import { ApiError } from '../../utils/ApiError.js';

export const getOrCreatePreferences = async (userId) => {
  let prefs = await UserPreferences.findOne({ userId });
  if (!prefs) prefs = await UserPreferences.create({ userId });
  return prefs;
};

export const updatePreferences = async (userId, data) => {
  const prefs = await getOrCreatePreferences(userId);
  if (data.language) prefs.language = data.language;
  if (data.theme) prefs.theme = data.theme;
  if (data.privacy) prefs.privacy = { ...prefs.privacy, ...data.privacy };
  if (data.notifications) prefs.notifications = { ...prefs.notifications, ...data.notifications };
  await prefs.save();
  return prefs.toSafeObject();
};

export const getOrCreateSecurity = async (userId) => {
  let sec = await UserSecurity.findOne({ userId });
  if (!sec) sec = await UserSecurity.create({ userId });
  return sec;
};

export const getSecurityOverview = async (userId) => {
  const sec = await getOrCreateSecurity(userId);
  const loginHistory = await LoginHistory.find({ userId }).sort({ createdAt: -1 }).limit(20);
  return {
    security: sec.toSafeObject(),
    loginHistory: loginHistory.map((l) => l.toSafeObject()),
    activeSessions: sec.activeSessions?.map((s) => ({
      sessionId: s.sessionId,
      ip: s.ip,
      userAgent: s.userAgent,
      lastActiveAt: s.lastActiveAt,
    })) || [],
    trustedDevices: sec.trustedDevices?.map((d) => ({
      deviceId: d.deviceId,
      name: d.name,
      trustedAt: d.trustedAt,
    })) || [],
  };
};

export const setupTwoFactor = async (userId) => {
  const speakeasy = (await import('speakeasy')).default;
  const user = await User.findById(userId);
  const secret = speakeasy.generateSecret({ name: `AI Career Platform (${user.email})` });
  const sec = await getOrCreateSecurity(userId);
  sec.twoFactorSecret = secret.base32;
  await sec.save();
  return { secret: secret.base32, otpauthUrl: secret.otpauth_url };
};

export const enableTwoFactor = async (userId, token) => {
  const speakeasy = (await import('speakeasy')).default;
  const sec = await UserSecurity.findOne({ userId }).select('+twoFactorSecret');
  const verified = speakeasy.totp.verify({ secret: sec.twoFactorSecret, encoding: 'base32', token });
  if (!verified) throw new ApiError(400, 'Invalid verification code');
  sec.twoFactorEnabled = true;
  await sec.save();
  return sec.toSafeObject();
};

export const disableTwoFactor = async (userId) => {
  const sec = await getOrCreateSecurity(userId);
  sec.twoFactorEnabled = false;
  sec.twoFactorSecret = '';
  await sec.save();
  return sec.toSafeObject();
};

export const updateBillingAddress = async (userId, data) => {
  const address = await BillingAddress.findOneAndUpdate({ userId }, data, { upsert: true, new: true });
  return address.toSafeObject();
};

export const getBillingAddress = async (userId) => {
  const address = await BillingAddress.findOne({ userId });
  return address?.toSafeObject() || null;
};

export const requestDataExport = async (userId) => {
  const sec = await getOrCreateSecurity(userId);
  sec.dataExportRequestedAt = new Date();
  await sec.save();
  return { requestedAt: sec.dataExportRequestedAt, message: 'Data export will be emailed within 48 hours.' };
};

export const requestAccountDeletion = async (userId, password) => {
  const user = await User.findById(userId).select('+password');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new ApiError(401, 'Invalid password');

  const sec = await getOrCreateSecurity(userId);
  sec.deleteRequestedAt = new Date();
  await sec.save();
  user.isActive = false;
  await user.save();
  return { deleted: true, message: 'Account scheduled for deletion.' };
};

export const revokeSession = async (userId, sessionId) => {
  const sec = await getOrCreateSecurity(userId);
  sec.activeSessions = sec.activeSessions.filter((s) => s.sessionId !== sessionId);
  await sec.save();
  return { revoked: true };
};

export const trustDevice = async (userId, { deviceId, name, ip, userAgent }) => {
  const sec = await getOrCreateSecurity(userId);
  if (!sec.trustedDevices.find((d) => d.deviceId === deviceId)) {
    sec.trustedDevices.push({ deviceId, name, ip, userAgent, trustedAt: new Date() });
  }
  await sec.save();
  return sec.trustedDevices;
};
