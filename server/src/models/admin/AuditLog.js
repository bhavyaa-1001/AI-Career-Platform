import mongoose from 'mongoose';

export const AUDIT_ACTIONS = [
  'login', 'logout', 'api_call', 'admin_action',
  'user_create', 'user_update', 'user_delete', 'user_suspend', 'user_ban',
  'recruiter_approve', 'recruiter_reject', 'job_approve', 'job_reject',
  'settings_update', 'cms_update', 'broadcast', 'report_resolve',
];

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    actorRole: { type: String, default: 'system' },
    action: { type: String, enum: AUDIT_ACTIONS, required: true, index: true },
    resource: { type: String, maxlength: 100, default: '' },
    resourceId: { type: String, maxlength: 50, default: '' },
    description: { type: String, required: true, maxlength: 500 },
    ip: { type: String, maxlength: 45, default: '' },
    userAgent: { type: String, maxlength: 500, default: '' },
    method: { type: String, maxlength: 10, default: '' },
    path: { type: String, maxlength: 300, default: '' },
    statusCode: { type: Number, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

auditLogSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    actorId: this.actorId?.toString() || null,
    actorRole: this.actorRole,
    action: this.action,
    resource: this.resource,
    resourceId: this.resourceId,
    description: this.description,
    ip: this.ip,
    method: this.method,
    path: this.path,
    statusCode: this.statusCode,
    metadata: this.metadata,
    createdAt: this.createdAt,
  };
};

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
