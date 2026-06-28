import crypto from 'crypto';

import { ApiKey, WebhookDelivery, WebhookEndpoint } from '../../models/saas/Developer.js';
import { ApiError } from '../../utils/ApiError.js';

export const createApiKey = async (userId, { name, scopes = ['read'], rateLimit = 1000 }) => {
  const raw = `acp_${crypto.randomBytes(24).toString('hex')}`;
  const key = await ApiKey.create({
    userId,
    name,
    keyPrefix: raw.slice(0, 12),
    keyHash: ApiKey.hashKey(raw),
    scopes,
    rateLimit,
  });
  return { apiKey: key.toSafeObject(), secret: raw };
};

export const listApiKeys = async (userId) => {
  const keys = await ApiKey.find({ userId, isActive: true }).sort({ createdAt: -1 });
  return keys.map((k) => k.toSafeObject());
};

export const revokeApiKey = async (userId, keyId) => {
  const key = await ApiKey.findOneAndUpdate({ _id: keyId, userId }, { isActive: false }, { new: true });
  if (!key) throw new ApiError(404, 'API key not found');
  return key.toSafeObject();
};

export const createWebhook = async (userId, { url, events = ['*'] }) => {
  const secret = crypto.randomBytes(24).toString('hex');
  const webhook = await WebhookEndpoint.create({ userId, url, secret, events });
  return { webhook: webhook.toSafeObject(), secret };
};

export const listWebhooks = async (userId) => {
  const hooks = await WebhookEndpoint.find({ userId, isActive: true }).sort({ createdAt: -1 });
  return hooks.map((h) => h.toSafeObject());
};

export const deleteWebhook = async (userId, webhookId) => {
  await WebhookEndpoint.findOneAndUpdate({ _id: webhookId, userId }, { isActive: false });
  return { deleted: true };
};

export const listWebhookLogs = async (userId, webhookId, { page = 1, limit = 30 } = {}) => {
  const hook = await WebhookEndpoint.findOne({ _id: webhookId, userId });
  if (!hook) throw new ApiError(404, 'Webhook not found');
  const skip = (page - 1) * limit;
  const logs = await WebhookDelivery.find({ endpointId: webhookId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
  return logs.map((l) => l.toSafeObject());
};

export const getDeveloperDashboard = async (userId) => {
  const [keys, webhooks] = await Promise.all([
    ApiKey.find({ userId, isActive: true }),
    WebhookEndpoint.find({ userId, isActive: true }),
  ]);

  return {
    apiKeys: keys.length,
    webhooks: webhooks.length,
    totalApiUsage: keys.reduce((s, k) => s + k.usageCount, 0),
  };
};
