import { useState } from 'react';

import { AdminFilters, AdminPageHeader, AdminPagination, AdminTable, StatusBadge } from '@/components/admin/AdminComponents';
import { Loader } from '@/components/common';
import { Button, Input } from '@/components/ui';
import { adminApi } from '@/lib/api/admin';
import { useAdminResumes } from '@/hooks/useAdmin';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function AdminResumesPage() {
  const [params, setParams] = useState({ page: 1, limit: 20 });
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminResumes(params);
  const qc = useQueryClient();

  const deleteMut = useMutation({
    mutationFn: adminApi.deleteResume,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'resumes'] }),
  });
  const restoreMut = useMutation({
    mutationFn: adminApi.restoreResume,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'resumes'] }),
  });

  const resumes = data?.data?.resumes || [];
  const pagination = data?.data?.pagination;

  if (isLoading) return <Loader className="py-20" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Resume Management" description="View, manage, and restore user resumes" />

      <AdminFilters>
        <Input placeholder="Search resumes..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
        <Button size="sm" onClick={() => setParams((p) => ({ ...p, page: 1, search: search || undefined }))}>Filter</Button>
      </AdminFilters>

      <AdminTable
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'template', label: 'Template' },
          { key: 'atsScore', label: 'ATS Score', render: (r) => r.atsScore != null ? `${r.atsScore}%` : '—' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.meta?.adminStatus || 'active'} variant={r.meta?.adminStatus === 'deleted' ? 'rejected' : 'active'} /> },
          { key: 'updatedAt', label: 'Updated', render: (r) => new Date(r.updatedAt).toLocaleDateString() },
          {
            key: 'actions', label: 'Actions',
            render: (r) => r.meta?.adminStatus === 'deleted' ? (
              <Button size="sm" variant="ghost" onClick={() => restoreMut.mutate(r.id)}>Restore</Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(r.id)}>Delete</Button>
            ),
          },
        ]}
        rows={resumes}
      />

      <AdminPagination pagination={pagination} onPageChange={(page) => setParams((p) => ({ ...p, page }))} />
    </div>
  );
}
