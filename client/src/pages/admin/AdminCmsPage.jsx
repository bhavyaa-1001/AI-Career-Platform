import { useState } from 'react';

import { AdminFilters, AdminPageHeader, AdminPagination, AdminTable, StatusBadge } from '@/components/admin/AdminComponents';
import { Loader } from '@/components/common';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Textarea } from '@/components/ui';
import { useAdminCms, useAdminCmsMutations } from '@/hooks/useAdmin';

const CMS_TYPES = [
  { value: 'homepage', label: 'Homepage' },
  { value: 'faq', label: 'FAQs' },
  { value: 'blog', label: 'Blogs' },
  { value: 'testimonial', label: 'Testimonials' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'terms', label: 'Terms' },
  { value: 'privacy', label: 'Privacy Policy' },
];

export function AdminCmsPage() {
  const [params, setParams] = useState({ page: 1, limit: 20 });
  const [type, setType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'faq', title: '', content: '', isPublished: false });
  const { data, isLoading } = useAdminCms(params);
  const mutations = useAdminCmsMutations();

  const items = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  if (isLoading) return <Loader className="py-20" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Content Management"
        description="Manage homepage, FAQs, blogs, testimonials, announcements, terms, and privacy"
        actions={<Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'New Content'}</Button>}
      />

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Content</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {CMS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
              Publish immediately
            </label>
            <Button onClick={() => mutations.create.mutate(form)} disabled={!form.title}>Create</Button>
          </CardContent>
        </Card>
      )}

      <AdminFilters>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          {CMS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
        <Button size="sm" onClick={() => setParams((p) => ({ ...p, page: 1, type: type || undefined }))}>Filter</Button>
      </AdminFilters>

      <AdminTable
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'type', label: 'Type', render: (r) => <span className="capitalize">{r.type}</span> },
          { key: 'isPublished', label: 'Status', render: (r) => <StatusBadge status={r.isPublished ? 'published' : 'draft'} variant={r.isPublished ? 'active' : 'pending'} /> },
          { key: 'updatedAt', label: 'Updated', render: (r) => new Date(r.updatedAt).toLocaleDateString() },
          { key: 'actions', label: '', render: (r) => (
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => mutations.update.mutate({ id: r.id, data: { isPublished: !r.isPublished } })}>{r.isPublished ? 'Unpublish' : 'Publish'}</Button>
              <Button size="sm" variant="ghost" onClick={() => mutations.delete.mutate(r.id)}>Delete</Button>
            </div>
          )},
        ]}
        rows={items}
      />

      <AdminPagination pagination={pagination} onPageChange={(page) => setParams((p) => ({ ...p, page }))} />
    </div>
  );
}
