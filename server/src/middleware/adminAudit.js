import { logAudit } from '../services/admin/auditService.js';

export const adminAuditMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    if (req.user?.role === 'admin' || req.user?.role === 'sub_admin') {
      logAudit({
        actorId: req.user._id,
        actorRole: 'admin',
        action: 'admin_action',
        description: `${req.method} ${req.originalUrl}`,
        ip: req.ip || req.headers['x-forwarded-for'] || '',
        userAgent: req.headers['user-agent'] || '',
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        metadata: { duration: Date.now() - start },
      });
    }
  });

  next();
};

export const apiAuditMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    if (req.user && req.path.startsWith('/api')) {
      logAudit({
        actorId: req.user._id,
        actorRole: req.user.role,
        action: 'api_call',
        description: `${req.method} ${req.originalUrl}`,
        ip: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        metadata: { duration: Date.now() - start },
      });
    }
  });

  next();
};
