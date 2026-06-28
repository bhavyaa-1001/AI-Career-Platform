import mongoose from 'mongoose';

export const CMS_TYPES = [
  'homepage', 'faq', 'blog', 'testimonial', 'announcement', 'terms', 'privacy',
];

const cmsContentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: CMS_TYPES, required: true, index: true },
    slug: { type: String, required: true, trim: true, maxlength: 200 },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    content: { type: String, default: '' },
    excerpt: { type: String, maxlength: 500, default: '' },
    author: { type: String, maxlength: 100, default: '' },
    imageUrl: { type: String, maxlength: 500, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    isPublished: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

cmsContentSchema.index({ type: 1, slug: 1 }, { unique: true });
cmsContentSchema.index({ type: 1, isPublished: 1, sortOrder: 1 });

cmsContentSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    type: this.type,
    slug: this.slug,
    title: this.title,
    content: this.content,
    excerpt: this.excerpt,
    author: this.author,
    imageUrl: this.imageUrl,
    metadata: this.metadata,
    isPublished: this.isPublished,
    sortOrder: this.sortOrder,
    publishedAt: this.publishedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const CmsContent = mongoose.model('CmsContent', cmsContentSchema);
