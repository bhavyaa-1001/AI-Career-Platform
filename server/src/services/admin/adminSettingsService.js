import {
  env, getCodeExecutionProvider, isCloudinaryConfigured, isCodeExecutionConfigured,
  isEmailConfigured, isGeminiConfigured, isJudge0Configured, isOnlineCompilerConfigured,
} from '../../config/env.js';
import { assertFullAdmin } from '../../config/roles.js';
import { PlatformSettings } from '../../models/admin/PlatformSettings.js';

import { logAdminAction } from './auditService.js';

const DEFAULT_SETTINGS = {
  global: {
    siteName: 'AI Career Platform',
    siteUrl: env.CLIENT_URL,
    supportEmail: 'support@aicareerplatform.com',
    registrationEnabled: true,
    defaultRole: 'student',
  },
  email: {
    configured: isEmailConfigured,
    from: env.EMAIL_FROM,
    host: env.SMTP_HOST || '',
  },
  cloudinary: {
    configured: isCloudinaryConfigured,
    cloudName: env.CLOUDINARY_CLOUD_NAME || '',
  },
  gemini: {
    configured: isGeminiConfigured,
    model: env.GEMINI_MODEL,
  },
  jwt: {
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    refreshRememberExpiresIn: env.JWT_REFRESH_REMEMBER_EXPIRES_IN,
  },
  branding: {
    logoUrl: '',
    primaryColor: '#6366f1',
    faviconUrl: '',
    tagline: 'AI-Powered Developer Career Platform',
  },
  maintenance: {
    enabled: false,
    message: 'We are currently performing maintenance. Please check back soon.',
    allowedRoles: ['admin'],
  },
  features: {
    coding: true,
    aiAnalysis: true,
    jobPortal: true,
    coverLetter: true,
    contests: true,
    resumeMatch: true,
  },
};

export const getAllSettings = async () => {
  const stored = await PlatformSettings.find({});
  const settings = { ...DEFAULT_SETTINGS };

  stored.forEach((s) => {
    settings[s.category] = { ...settings[s.category], ...s.value, _id: s._id.toString() };
  });

  return settings;
};

export const getSettingsByCategory = async (category) => {
  const stored = await PlatformSettings.findOne({ category });
  return { ...DEFAULT_SETTINGS[category], ...(stored?.value || {}) };
};

export const updateSettings = async (admin, category, value) => {
  assertFullAdmin(admin.role);
  const setting = await PlatformSettings.findOneAndUpdate(
    { category },
    { key: category, category, value, updatedBy: admin._id },
    { upsert: true, new: true },
  );

  await logAdminAction(admin, 'settings_update', `Updated ${category} settings`, {
    resource: 'settings', resourceId: category,
  });

  return { ...DEFAULT_SETTINGS[category], ...setting.value };
};

export const getServiceStatus = () => ({
  email: isEmailConfigured,
  cloudinary: isCloudinaryConfigured,
  gemini: isGeminiConfigured,
  codeExecution: isCodeExecutionConfigured,
  codeExecutionProvider: getCodeExecutionProvider(),
  onlineCompiler: isOnlineCompilerConfigured,
  judge0: isJudge0Configured,
  mongodb: true,
});
