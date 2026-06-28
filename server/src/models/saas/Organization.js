import mongoose from 'mongoose';

export const ORG_ROLES = ['owner', 'admin', 'member', 'viewer'];

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
    stripeCustomerId: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

organizationSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    slug: this.slug,
    ownerId: this.ownerId.toString(),
    planId: this.planId?.toString() || null,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

export const Organization = mongoose.model('Organization', organizationSchema);

const organizationMemberSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ORG_ROLES, default: 'member' },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    inviteEmail: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'active', 'removed'], default: 'active', index: true },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true },
);

organizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

organizationMemberSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    organizationId: this.organizationId.toString(),
    userId: this.userId.toString(),
    role: this.role,
    status: this.status,
    permissions: this.permissions,
    createdAt: this.createdAt,
  };
};

export const OrganizationMember = mongoose.model('OrganizationMember', organizationMemberSchema);
