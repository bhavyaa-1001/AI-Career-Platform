import { BillingAccount } from '../../models/saas/BillingAccount.js';
import { Organization, OrganizationMember, ORG_ROLES } from '../../models/saas/Organization.js';
import { ApiError } from '../../utils/ApiError.js';

const slugify = (name) => name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 80);

export const createOrganization = async (userId, { name }) => {
  const slug = `${slugify(name)}-${Date.now().toString(36)}`;
  const org = await Organization.create({ name, slug, ownerId: userId });
  await OrganizationMember.create({
    organizationId: org._id,
    userId,
    role: 'owner',
    status: 'active',
  });
  await BillingAccount.findOneAndUpdate({ userId }, { organizationId: org._id });
  return org.toSafeObject();
};

export const getMyOrganizations = async (userId) => {
  const memberships = await OrganizationMember.find({ userId, status: 'active' }).populate('organizationId');
  return memberships.map((m) => ({
    ...m.organizationId?.toSafeObject?.() || m.organizationId,
    memberRole: m.role,
    permissions: m.permissions,
  }));
};

export const inviteMember = async (userId, orgId, { email, role = 'member' }) => {
  if (!ORG_ROLES.includes(role)) throw new ApiError(400, 'Invalid role');
  const membership = await OrganizationMember.findOne({ organizationId: orgId, userId, status: 'active' });
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    throw new ApiError(403, 'Insufficient permissions');
  }

  const invite = await OrganizationMember.create({
    organizationId: orgId,
    userId,
    role,
    inviteEmail: email,
    status: 'pending',
    invitedBy: userId,
  });

  return invite.toSafeObject();
};

export const listMembers = async (userId, orgId) => {
  const membership = await OrganizationMember.findOne({ organizationId: orgId, userId, status: 'active' });
  if (!membership) throw new ApiError(403, 'Not a member');

  const members = await OrganizationMember.find({ organizationId: orgId, status: { $ne: 'removed' } })
    .populate('userId', 'firstName lastName email');
  return members.map((m) => ({
    id: m._id.toString(),
    role: m.role,
    status: m.status,
    inviteEmail: m.inviteEmail,
    user: m.userId ? {
      id: m.userId._id?.toString(),
      name: `${m.userId.firstName} ${m.userId.lastName}`,
      email: m.userId.email,
    } : null,
  }));
};
