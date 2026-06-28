import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AdminFilters, AdminPageHeader, AdminPagination, AdminTable, StatusBadge } from '@/components/admin/AdminComponents';
import { Loader } from '@/components/common';
import { Button, Select } from '@/components/ui';
import { adminApi } from '@/lib/api/admin';
import { useAdminReports } from '@/hooks/useAdmin';

export function AdminReportsPage() {
  const [params, setParams] = useState({ page: 1, limit: 20 });
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const { data, isLoading } = useAdminReports(params);
  const qc = useQueryClient();

  const resolveMut = useMutation({
    mutationFn: ({ id, data }) => adminApi.resolveReport(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  });

  const reports = data?.data?.reports || [];
  const pagination = data?.data?.pagination;

  if (isLoading) return <Loader className="py-20" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Reports" description="User reports, job reports, spam, and abuse reports" />

      <AdminFilters>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="user">User</option>
          <option value="job">Job</option>
          <option value="spam">Spam</option>
          <option value="abuse">Abuse</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </Select>
        <Button size="sm" onClick={() => setParams((p) => ({ ...p, page: 1, type: type || undefined, status: status || undefined }))}>Filter</Button>
      </AdminFilters>

      <AdminTable
        columns={[
          { key: 'type', label: 'Type', render: (r) => <span className="capitalize">{r.type}</span> },
          { key: 'reason', label: 'Reason' },
          { key: 'targetType', label: 'Target', render: (r) => `${r.targetType || '—'} ${r.targetId ? `#${r.targetId.slice(-6)}` : ''}` },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} variant={r.status === 'resolved' ? 'active' : 'pending'} /> },
          { key: 'createdAt', label: 'Reported', render: (r) => new Date(r.createdAt).toLocaleDateString() },
          { key: 'actions', label: '', render: (r) => r.status === 'pending' && (
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => resolveMut.mutate({ id: r.id, data: { status: 'resolved', resolution: 'Resolved by admin' } })}>Resolve</Button>
              <Button size="sm" variant="ghost" onClick={() => resolveMut.mutate({ id: r.id, data: { status: 'dismissed', resolution: 'Dismissed' } })}>Dismiss</Button>
            </div>
          )},
        ]}
        rows={reports}
      />

      <AdminPagination pagination={pagination} onPageChange={(page) => setParams((p) => ({ ...p, page }))} />
    </div>
  );
}
