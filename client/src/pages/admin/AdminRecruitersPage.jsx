import { useState } from 'react';

import {
  AdminFilters, AdminPageHeader, AdminPagination, AdminTable, StatusBadge,
} from '@/components/admin/AdminComponents';
import { Loader } from '@/components/common';
import { Button, Input, Select } from '@/components/ui';
import { useAdminRecruiters, useAdminRecruiterMutations } from '@/hooks/useAdmin';

export function AdminRecruitersPage() {
  const [params, setParams] = useState({ page: 1, limit: 20 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { data, isLoading } = useAdminRecruiters(params);
  const mutations = useAdminRecruiterMutations();

  const recruiters = data?.data?.recruiters || [];
  const pagination = data?.data?.pagination;

  if (isLoading) return <Loader className="py-20" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Recruiter Management" description="Approve, verify, and manage recruiter accounts" />

      <AdminFilters>
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </Select>
        <Button size="sm" onClick={() => setParams((p) => ({ ...p, page: 1, search: search || undefined, status: status || undefined }))}>Filter</Button>
      </AdminFilters>

      <AdminTable
        columns={[
          { key: 'name', label: 'Recruiter', render: (r) => `${r.firstName} ${r.lastName}` },
          { key: 'email', label: 'Email' },
          { key: 'company', label: 'Company', render: (r) => r.company?.name || '—' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.meta?.status || 'approved'} variant={r.meta?.status || 'approved'} /> },
          { key: 'kyc', label: 'KYC', render: (r) => <StatusBadge status={r.meta?.kycStatus || 'not_started'} /> },
          { key: 'premium', label: 'Premium', render: (r) => r.meta?.premiumStatus || 'none' },
          { key: 'verified', label: 'Verified', render: (r) => r.meta?.isVerified ? '✓' : '—' },
          {
            key: 'actions', label: 'Actions',
            render: (r) => (
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="ghost" onClick={() => mutations.approve.mutate(r.id)}>Approve</Button>
                <Button size="sm" variant="ghost" onClick={() => mutations.reject.mutate({ id: r.id })}>Reject</Button>
                <Button size="sm" variant="ghost" onClick={() => mutations.verify.mutate(r.id)}>Verify</Button>
                <Button size="sm" variant="ghost" onClick={() => mutations.suspend.mutate({ id: r.id })}>Suspend</Button>
              </div>
            ),
          },
        ]}
        rows={recruiters}
      />

      <AdminPagination pagination={pagination} onPageChange={(page) => setParams((p) => ({ ...p, page }))} />
    </div>
  );
}
