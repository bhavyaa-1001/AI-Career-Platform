import { User } from '../../models/User.js';
import { BroadcastMessage } from '../../models/admin/BroadcastMessage.js';
import { ApiError } from '../../utils/ApiError.js';
import { createNotification } from '../notificationService.js';

import { logAdminAction } from './auditService.js';

const paginate = (page, limit, total) => ({
  page, limit, total, pages: Math.ceil(total / limit) || 1,
});

export const listBroadcasts = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.status) filter.status = query.status;

  const [broadcasts, total] = await Promise.all([
    BroadcastMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    BroadcastMessage.countDocuments(filter),
  ]);

  return {
    broadcasts: broadcasts.map((b) => b.toSafeObject()),
    pagination: paginate(page, limit, total),
  };
};

export const createBroadcast = async (admin, data) => {
  const broadcast = await BroadcastMessage.create({
    ...data,
    createdBy: admin._id,
    status: data.sendNow ? 'sent' : 'draft',
    sentAt: data.sendNow ? new Date() : null,
  });

  if (data.sendNow) {
    await sendBroadcast(broadcast);
  }

  return broadcast.toSafeObject();
};

export const sendBroadcast = async (broadcast) => {
  const filter = {};
  if (broadcast.targetRoles?.length) filter.role = { $in: broadcast.targetRoles };

  const users = await User.find({ ...filter, isActive: true }).select('_id');
  let count = 0;

  if (broadcast.channels.includes('in_app')) {
    for (const user of users) {
      await createNotification(user._id, {
        type: 'system',
        title: broadcast.title,
        message: broadcast.message,
        link: broadcast.link || null,
      });
      count += 1;
    }
  }

  broadcast.status = 'sent';
  broadcast.sentAt = new Date();
  broadcast.recipientCount = count;
  await broadcast.save();

  return broadcast.toSafeObject();
};

export const sendBroadcastById = async (admin, broadcastId) => {
  const broadcast = await BroadcastMessage.findById(broadcastId);
  if (!broadcast) throw new ApiError(404, 'Broadcast not found');
  if (broadcast.status === 'sent') throw new ApiError(400, 'Broadcast already sent');

  const result = await sendBroadcast(broadcast);

  await logAdminAction(admin, 'broadcast', `Sent broadcast: ${broadcast.title}`, {
    resource: 'broadcast', resourceId: broadcastId,
    metadata: { recipientCount: result.recipientCount },
  });

  return result;
};

export const deleteBroadcast = async (admin, broadcastId) => {
  const broadcast = await BroadcastMessage.findByIdAndDelete(broadcastId);
  if (!broadcast) throw new ApiError(404, 'Broadcast not found');
  return { deleted: true };
};
