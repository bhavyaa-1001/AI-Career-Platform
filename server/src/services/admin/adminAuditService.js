import { AuditLog } from '../../models/admin/AuditLog.js';

const paginate = (page, limit, total) => ({
  page, limit, total, pages: Math.ceil(total / limit) || 1,
});

export const listAuditLogs = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 50, 200);
  const skip = (page - 1) * limit;
  const filter = {};

  if (query.action) filter.action = query.action;
  if (query.actorId) filter.actorId = query.actorId;
  if (query.resource) filter.resource = query.resource;
  if (query.search) {
    filter.$or = [
      { description: new RegExp(query.search.trim(), 'i') },
      { path: new RegExp(query.search.trim(), 'i') },
    ];
  }
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  return {
    logs: logs.map((l) => l.toSafeObject()),
    pagination: paginate(page, limit, total),
  };
};

export const exportAuditLogsCsv = async (query = {}) => {
  const { logs } = await listAuditLogs({ ...query, limit: 1000, page: 1 });
  const headers = ['id', 'action', 'actorId', 'actorRole', 'description', 'method', 'path', 'statusCode', 'ip', 'createdAt'];
  const rows = logs.map((l) =>
    headers.map((h) => {
      const val = l[h];
      if (val === null || val === undefined) return '';
      return String(val).includes(',') ? `"${val}"` : val;
    }).join(','),
  );
  return [headers.join(','), ...rows].join('\n');
};

export const getAuditStats = async () => {
  const [byAction, recentCount] = await Promise.all([
    AuditLog.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AuditLog.countDocuments({ createdAt: { $gte: new Date(Date.now() - 86400000) } }),
  ]);

  return {
    last24Hours: recentCount,
    byAction: Object.fromEntries(byAction.map((a) => [a._id, a.count])),
  };
};
