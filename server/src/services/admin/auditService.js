import { AuditLog } from '../../models/admin/AuditLog.js';

export const logAudit = async ({
  actorId = null,
  actorRole = 'system',
  action,
  resource = '',
  resourceId = '',
  description,
  ip = '',
  userAgent = '',
  method = '',
  path = '',
  statusCode = null,
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      actorId,
      actorRole,
      action,
      resource,
      resourceId,
      description,
      ip,
      userAgent,
      method,
      path,
      statusCode,
      metadata,
    });
  } catch {
    // audit logging should never break requests
  }
};

export const logAdminAction = async (admin, action, description, extra = {}) => {
  await logAudit({
    actorId: admin?._id,
    actorRole: admin?.role || 'admin',
    action: 'admin_action',
    description,
    metadata: { subAction: action, ...extra.metadata },
    ...extra,
  });
};
