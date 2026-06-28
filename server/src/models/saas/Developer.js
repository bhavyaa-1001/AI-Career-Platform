import crypto from 'crypto';

import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    keyPrefix: { type: String, required: true, index: true },
    keyHash: { type: String, required: true, select: false },
    scopes: { type: [String], default: ['read'] },
    rateLimit: { type: Number, default: 1000 },
    usageCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

apiKeySchema.statics.hashKey = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

apiKeySchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    keyPrefix: this.keyPrefix,
    scopes: this.scopes,
    rateLimit: this.rateLimit,
    usageCount: this.usageCount,
    lastUsedAt: this.lastUsedAt,
    expiresAt: this.expiresAt,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

export const ApiKey = mongoose.model('ApiKey', apiKeySchema);

const webhookEndpointSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    url: { type: String, required: true, maxlength: 500 },
    secret: { type: String, required: true, select: false },
    events: { type: [String], default: ['*'] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

webhookEndpointSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    url: this.url,
    events: this.events,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

export const WebhookEndpoint = mongoose.model('WebhookEndpoint', webhookEndpointSchema);

const webhookDeliverySchema = new mongoose.Schema(
  {
    endpointId: { type: mongoose.Schema.Types.ObjectId, ref: 'WebhookEndpoint', required: true, index: true },
    event: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    statusCode: { type: Number, default: null },
    success: { type: Boolean, default: false, index: true },
    responseBody: { type: String, default: '', maxlength: 2000 },
    attempt: { type: Number, default: 1 },
  },
  { timestamps: true },
);

webhookDeliverySchema.index({ endpointId: 1, createdAt: -1 });

webhookDeliverySchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    event: this.event,
    success: this.success,
    statusCode: this.statusCode,
    attempt: this.attempt,
    createdAt: this.createdAt,
  };
};

export const WebhookDelivery = mongoose.model('WebhookDelivery', webhookDeliverySchema);
