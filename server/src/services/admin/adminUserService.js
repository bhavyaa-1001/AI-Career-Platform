import bcrypt from 'bcryptjs';

import { Activity } from '../../models/Activity.js';
import { User, ROLES } from '../../models/User.js';
import { AdminUserMeta } from '../../models/admin/AdminUserMeta.js';
import { AiUsageLog } from '../../models/admin/AiUsageLog.js';
import { LoginHistory } from '../../models/admin/LoginHistory.js';
import { assertCanAssignRole, assertCanModifyPrivilegedUser, isFullAdmin } from '../../config/roles.js';
import { ApiError } from '../../utils/ApiError.js';

import { logAdminAction } from './auditService.js';

const paginate = (page, limit, total) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit) || 1,
});

const buildUserFilter = ({ role, search, isActive, isBanned, isSuspended }) => {
  const filter = {};
  if (role && ROLES.includes(role)) filter.role = role;
  if (isActive === 'true') filter.isActive = true;
  if (isActive === 'false') filter.isActive = false;
  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
  }
  return { filter, isBanned, isSuspended };
};

export const listUsers = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const { filter, isBanned, isSuspended } = buildUserFilter(query);

  let userIds = null;
  if (typeof isBanned === 'boolean' || typeof isSuspended === 'boolean') {
    const metaFilter = {};
    if (typeof isBanned === 'boolean') metaFilter.isBanned = isBanned;
    if (typeof isSuspended === 'boolean') metaFilter.isSuspended = isSuspended;
    const metas = await AdminUserMeta.find(metaFilter).select('userId');
    userIds = metas.map((m) => m.userId);
    filter._id = { $in: userIds.length ? userIds : ['000000000000000000000000'] };
  }

  const sortField = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  const ids = users.map((u) => u._id);
  const metas = await AdminUserMeta.find({ userId: { $in: ids } });
  const metaMap = Object.fromEntries(metas.map((m) => [m.userId.toString(), m.toSafeObject()]));

  return {
    users: users.map((u) => ({
      ...u.toSafeObject(),
      meta: metaMap[u._id.toString()] || null,
    })),
    pagination: paginate(page, limit, total),
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const [meta, loginHistory, aiUsage, activities] = await Promise.all([
    AdminUserMeta.findOne({ userId }),
    LoginHistory.find({ userId }).sort({ createdAt: -1 }).limit(20),
    AiUsageLog.find({ userId }).sort({ createdAt: -1 }).limit(50),
    Activity.find({ userId }).sort({ createdAt: -1 }).limit(20),
  ]);

  const aiStats = await AiUsageLog.aggregate([
    { $match: { userId: user._id } },
    { $group: { _id: '$feature', count: { $sum: 1 }, tokens: { $sum: '$tokensUsed' } } },
  ]);

  return {
    user: user.toSafeObject(),
    meta: meta?.toSafeObject() || null,
    loginHistory: loginHistory.map((l) => l.toSafeObject()),
    aiUsage: aiUsage.map((a) => a.toSafeObject()),
    aiStats: aiStats.map((s) => ({ feature: s._id, count: s.count, tokens: s.tokens })),
    activities: activities.map((a) => a.toSafeObject()),
  };
};

export const createUser = async (admin, data) => {
  if (['admin', 'sub_admin'].includes(data.role) && !isFullAdmin(admin.role)) {
    throw new ApiError(403, 'Only full admins can create admin accounts');
  }
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) throw new ApiError(409, 'Email already registered');

  const hashed = await bcrypt.hash(data.password, 12);
  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: hashed,
    role: data.role || 'student',
    isEmailVerified: data.isEmailVerified ?? true,
    isActive: true,
  });

  await logAdminAction(admin, 'user_create', `Created user ${user.email}`, {
    resource: 'user',
    resourceId: user._id.toString(),
  });

  return user.toSafeObject();
};

export const updateUser = async (admin, userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  assertCanModifyPrivilegedUser(admin.role, user.role);
  if (data.role !== undefined) {
    assertCanAssignRole(admin.role, data.role, user.role);
  }

  const allowed = ['firstName', 'lastName', 'email', 'role', 'isActive', 'isEmailVerified'];
  allowed.forEach((key) => {
    if (data[key] !== undefined) user[key] = data[key];
  });
  await user.save();

  await logAdminAction(admin, 'user_update', `Updated user ${user.email}`, {
    resource: 'user',
    resourceId: user._id.toString(),
    metadata: { changes: Object.keys(data) },
  });

  return user.toSafeObject();
};

export const deleteUser = async (admin, userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  assertCanModifyPrivilegedUser(admin.role, user.role);
  if (user.role === 'admin') throw new ApiError(403, 'Cannot delete full admin accounts');

  await User.findByIdAndDelete(userId);
  await AdminUserMeta.deleteOne({ userId });

  await logAdminAction(admin, 'user_delete', `Deleted user ${user.email}`, {
    resource: 'user',
    resourceId: userId,
  });

  return { deleted: true };
};

const upsertMeta = async (userId, updates, adminId) => {
  return AdminUserMeta.findOneAndUpdate(
    { userId },
    { ...updates, lastModifiedBy: adminId },
    { upsert: true, new: true },
  );
};

export const suspendUser = async (admin, userId, { reason = '', until = null } = {}) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  assertCanModifyPrivilegedUser(admin.role, user.role);

  user.isActive = false;
  await user.save();
  const meta = await upsertMeta(userId, {
    isSuspended: true,
    suspendedUntil: until ? new Date(until) : null,
    suspendReason: reason,
  }, admin._id);

  await logAdminAction(admin, 'user_suspend', `Suspended user ${user.email}`, {
    resource: 'user',
    resourceId: userId,
  });

  return { user: user.toSafeObject(), meta: meta.toSafeObject() };
};

export const activateUser = async (admin, userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  user.isActive = true;
  await user.save();
  const meta = await upsertMeta(userId, {
    isSuspended: false,
    suspendedUntil: null,
    suspendReason: '',
    isBanned: false,
    bannedAt: null,
    bannedReason: '',
  }, admin._id);

  await logAdminAction(admin, 'user_update', `Activated user ${user.email}`, {
    resource: 'user',
    resourceId: userId,
  });

  return { user: user.toSafeObject(), meta: meta.toSafeObject() };
};

export const banUser = async (admin, userId, { reason = '' } = {}) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  assertCanModifyPrivilegedUser(admin.role, user.role);
  if (user.role === 'admin') throw new ApiError(403, 'Cannot ban full admin accounts');

  user.isActive = false;
  await user.save();
  const meta = await upsertMeta(userId, {
    isBanned: true,
    bannedAt: new Date(),
    bannedReason: reason,
    isSuspended: true,
  }, admin._id);

  await logAdminAction(admin, 'user_ban', `Banned user ${user.email}`, {
    resource: 'user',
    resourceId: userId,
  });

  return { user: user.toSafeObject(), meta: meta.toSafeObject() };
};

export const unbanUser = async (admin, userId) => activateUser(admin, userId);

export const assignRole = async (admin, userId, role) => {
  if (!ROLES.includes(role)) throw new ApiError(400, 'Invalid role');
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  assertCanAssignRole(admin.role, role, user.role);
  return updateUser(admin, userId, { role });
};

export const resetUserPassword = async (admin, userId, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');
  assertCanModifyPrivilegedUser(admin.role, user.role);

  user.password = await bcrypt.hash(newPassword, 12);
  user.refreshTokens = [];
  await user.save();

  await logAdminAction(admin, 'user_update', `Reset password for ${user.email}`, {
    resource: 'user',
    resourceId: userId,
  });

  return { success: true };
};

export const bulkUserAction = async (admin, { userIds, action, data = {} }) => {
  if (!Array.isArray(userIds) || !userIds.length) throw new ApiError(400, 'No users selected');

  const results = [];
  for (const id of userIds) {
    try {
      let result;
      switch (action) {
        case 'suspend': result = await suspendUser(admin, id, data); break;
        case 'activate': result = await activateUser(admin, id); break;
        case 'ban': result = await banUser(admin, id, data); break;
        case 'delete': result = await deleteUser(admin, id); break;
        default: throw new ApiError(400, 'Invalid bulk action');
      }
      results.push({ id, success: true, result });
    } catch (err) {
      results.push({ id, success: false, error: err.message });
    }
  }
  return { results };
};

export const exportUsersCsv = async (query = {}) => {
  const { users } = await listUsers({ ...query, limit: 1000, page: 1 });
  const headers = ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'isEmailVerified', 'lastLogin', 'createdAt'];
  const rows = users.map((u) =>
    headers.map((h) => {
      const val = u[h];
      if (val === null || val === undefined) return '';
      return String(val).includes(',') ? `"${val}"` : val;
    }).join(','),
  );
  return [headers.join(','), ...rows].join('\n');
};

export const recordLogin = async (userId, { ip = '', userAgent = '', success = true, method = 'password' } = {}) => {
  await LoginHistory.create({ userId, ip, userAgent, success, method });
};

export const recordAiUsage = async (userId, feature, { tokensUsed = 0, success = true, metadata = {} } = {}) => {
  await AiUsageLog.create({ userId, feature, tokensUsed, success, metadata });
};
