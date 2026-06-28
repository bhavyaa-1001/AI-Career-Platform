import { useState } from 'react';

import { AdminFilters, AdminPageHeader, AdminPagination, AdminTable } from '@/components/admin/AdminComponents';
import { Loader } from '@/components/common';
import { Button, Input } from '@/components/ui';
import { adminApi, downloadAdminExport } from '@/lib/api/admin';
import { useAdminAudit } from '@/hooks/useAdmin';

export function AdminAuditPage() {
  const [params, setParams] = useState({ page: 1, limit: 50 });
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAdminAudit(params);

  const logs = data?.data?.logs || [];
  const pagination = data?.data?.pagination;

  const handleExport = () => downloadAdminExport(adminApi.exportAudit, params, 'audit-logs.csv');

  if (isLoading) return <Loader className="py-20" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit Logs"
        description="Track every login, API call, and admin action"
        actions={<Button variant="outline" size="sm" onClick={handleExport}>Export CSV</Button>}
      />

      <AdminFilters>
        <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
        <Button size="sm" onClick={() => setParams((p) => ({ ...p, page: 1, search: search || undefined }))}>Search</Button>
      </AdminFilters>

      <AdminTable
        columns={[
          { key: 'createdAt', label: 'Time', render: (r) => new Date(r.createdAt).toLocaleString() },
          { key: 'action', label: 'Action', render: (r) => <span className="font-mono text-xs">{r.action}</span> },
          { key: 'description', label: 'Description' },
          { key: 'actorRole', label: 'Role' },
          { key: 'method', label: 'Method', render: (r) => r.method || '—' },
          { key: 'path', label: 'Path', render: (r) => <span className="font-mono text-xs">{r.path?.slice(0, 40) || '—'}</span> },
          { key: 'statusCode', label: 'Status', render: (r) => r.statusCode || '—' },
          { key: 'ip', label: 'IP', render: (r) => r.ip || '—' },
        ]}
        rows={logs}
      />

      <AdminPagination pagination={pagination} onPageChange={(page) => setParams((p) => ({ ...p, page }))} />
    </div>
  );
}
