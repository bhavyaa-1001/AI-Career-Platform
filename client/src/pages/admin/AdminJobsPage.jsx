import { useState } from 'react';

import {
  AdminFilters, AdminPageHeader, AdminPagination, AdminTable, StatusBadge,
} from '@/components/admin/AdminComponents';
import { Loader } from '@/components/common';
import { Button, Input, Select } from '@/components/ui';
import { useAdminJobs, useAdminJobMutations } from '@/hooks/useAdmin';

export function AdminJobsPage() {
  const [params, setParams] = useState({ page: 1, limit: 20 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const { data, isLoading } = useAdminJobs(params);
  const mutations = useAdminJobMutations();

  const jobs = data?.data?.jobs || [];
  const pagination = data?.data?.pagination;

  if (isLoading) return <Loader className="py-20" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Job Management" description="Moderate, feature, and manage job postings" />

      <AdminFilters>
        <Input placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
        <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Jobs</option>
          <option value="featured">Featured</option>
          <option value="pending">Pending Approval</option>
          <option value="expired">Expired</option>
        </Select>
        <Button size="sm" onClick={() => {
          const p = { page: 1, limit: 20, search: search || undefined };
          if (filter === 'featured') p.featured = 'true';
          if (filter === 'pending') p.moderationStatus = 'pending';
          if (filter === 'expired') p.adminStatus = 'expired';
          setParams(p);
        }}>Filter</Button>
      </AdminFilters>

      <AdminTable
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'companyName', label: 'Company' },
          { key: 'location', label: 'Location' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          { key: 'moderation', label: 'Moderation', render: (r) => <StatusBadge status={r.meta?.moderationStatus || 'approved'} variant={r.meta?.moderationStatus || 'approved'} /> },
          { key: 'featured', label: 'Featured', render: (r) => r.meta?.isFeatured ? '★' : '—' },
          { key: 'applicants', label: 'Applicants', render: (r) => r.applicantCount },
          { key: 'createdAt', label: 'Posted', render: (r) => new Date(r.createdAt).toLocaleDateString() },
          {
            key: 'actions', label: 'Actions',
            render: (r) => (
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="ghost" onClick={() => mutations.approve.mutate(r.id)}>Approve</Button>
                <Button size="sm" variant="ghost" onClick={() => mutations.reject.mutate({ id: r.id })}>Reject</Button>
                <Button size="sm" variant="ghost" onClick={() => mutations.feature.mutate({ id: r.id })}>Feature</Button>
                <Button size="sm" variant="ghost" onClick={() => mutations.delete.mutate(r.id)}>Delete</Button>
              </div>
            ),
          },
        ]}
        rows={jobs}
      />

      <AdminPagination pagination={pagination} onPageChange={(page) => setParams((p) => ({ ...p, page }))} />
    </div>
  );
}
