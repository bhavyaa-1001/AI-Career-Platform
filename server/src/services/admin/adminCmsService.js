import { CmsContent, CMS_TYPES } from '../../models/admin/CmsContent.js';
import { ApiError } from '../../utils/ApiError.js';

import { logAdminAction } from './auditService.js';

const paginate = (page, limit, total) => ({
  page, limit, total, pages: Math.ceil(total / limit) || 1,
});

const slugify = (text) =>
  text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 200);

export const listCmsContent = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.type && CMS_TYPES.includes(query.type)) filter.type = query.type;
  if (query.isPublished !== undefined) filter.isPublished = query.isPublished === 'true';
  if (query.search) {
    filter.$or = [
      { title: new RegExp(query.search.trim(), 'i') },
      { slug: new RegExp(query.search.trim(), 'i') },
    ];
  }

  const [items, total] = await Promise.all([
    CmsContent.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
    CmsContent.countDocuments(filter),
  ]);

  return {
    items: items.map((i) => i.toSafeObject()),
    pagination: paginate(page, limit, total),
    types: CMS_TYPES,
  };
};

export const getCmsById = async (id) => {
  const item = await CmsContent.findById(id);
  if (!item) throw new ApiError(404, 'Content not found');
  return item.toSafeObject();
};

export const createCmsContent = async (admin, data) => {
  const slug = data.slug || slugify(data.title);
  const item = await CmsContent.create({
    ...data,
    slug,
    createdBy: admin._id,
    updatedBy: admin._id,
    publishedAt: data.isPublished ? new Date() : null,
  });

  await logAdminAction(admin, 'cms_update', `Created CMS ${data.type}: ${data.title}`, {
    resource: 'cms', resourceId: item._id.toString(),
  });

  return item.toSafeObject();
};

export const updateCmsContent = async (admin, id, data) => {
  const item = await CmsContent.findById(id);
  if (!item) throw new ApiError(404, 'Content not found');

  Object.assign(item, data, { updatedBy: admin._id });
  if (data.isPublished && !item.publishedAt) item.publishedAt = new Date();
  await item.save();

  await logAdminAction(admin, 'cms_update', `Updated CMS ${item.title}`, {
    resource: 'cms', resourceId: id,
  });

  return item.toSafeObject();
};

export const deleteCmsContent = async (admin, id) => {
  const item = await CmsContent.findByIdAndDelete(id);
  if (!item) throw new ApiError(404, 'Content not found');

  await logAdminAction(admin, 'cms_update', `Deleted CMS ${item.title}`, {
    resource: 'cms', resourceId: id,
  });

  return { deleted: true };
};

export const getCmsByType = async (type) => {
  if (!CMS_TYPES.includes(type)) throw new ApiError(400, 'Invalid CMS type');
  const items = await CmsContent.find({ type, isPublished: true }).sort({ sortOrder: 1 });
  return items.map((i) => i.toSafeObject());
};
