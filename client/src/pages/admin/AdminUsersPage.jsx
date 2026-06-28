import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  AdminFilters, AdminPageHeader, AdminPagination, AdminTable, RoleBadge, StatusBadge,
} from '@/components/admin/AdminComponents';
import { Loader } from '@/components/common';
import { Button, Input, Select } from '@/components/ui';
import { adminApi, downloadAdminExport } from '@/lib/api/admin';
import { ROLE_OPTIONS } from '@/features/admin/constants';
import { useAdminUsers, useAdminUserMutations } from '@/hooks/useAdmin';

export function AdminUsersPage() {
  const [params, setParams] = useState({ page: 1, limit: 20 });
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [selected, setSelected] = useState([]);
  const { data, isLoading } = useAdminUsers(params);
  const mutations = useAdminUserMutations();

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination;

  const applyFilters = () => setParams((p) => ({ ...p, page: 1, search: search || undefined, role: role || undefined }));

  const handleBulk = async (action) => {
    if (!selected.length) return;
    await mutations.bulkAction.mutateAsync({ userIds: selected, action });
    setSelected([]);
  };

  const handleExport = async () => {
    await downloadAdminExport(adminApi.exportUsers, params, 'users.csv');
  };

  if (isLoading) return <Loader className="py-20" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Management"
        description="Manage students, recruiters, sub-admins, and admins"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>Export CSV</Button>
            {selected.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={() => handleBulk('activate')}>Activate ({selected.length})</Button>
                <Button variant="outline" size="sm" onClick={() => handleBulk('suspend')}>Suspend</Button>
                <Button variant="destructive" size="sm" onClick={() => handleBulk('ban')}>Ban</Button>
              </>
            )}
          </>
        }
      />

      <AdminFilters>
        <Input placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
        <Select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All Roles</option>
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
        <Button size="sm" onClick={applyFilters}>Filter</Button>
      </AdminFilters>

      <AdminTable
        columns={[
          {
            key: 'select',
            label: '',
            render: (r) => (
              <input
                type="checkbox"
                checked={selected.includes(r.id)}
                onChange={() => setSelected((s) => s.includes(r.id) ? s.filter((x) => x !== r.id) : [...s, r.id])}
              />
            ),
          },
          { key: 'name', label: 'Name', render: (r) => <Link to={`/admin/users/${r.id}`} className="font-medium text-primary hover:underline">{r.firstName} {r.lastName}</Link> },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', render: (r) => <RoleBadge role={r.role} /> },
          { key: 'status', label: 'Status', render: (r) => {
            if (r.meta?.isBanned) return <StatusBadge status="banned" variant="banned" />;
            if (r.meta?.isSuspended) return <StatusBadge status="suspended" variant="suspended" />;
            return <StatusBadge status={r.isActive ? 'active' : 'inactive'} variant={r.isActive ? 'active' : 'inactive'} />;
          }},
          { key: 'lastLogin', label: 'Last Login', render: (r) => r.lastLogin ? new Date(r.lastLogin).toLocaleDateString() : '—' },
          {
            key: 'actions',
            label: 'Actions',
            render: (r) => (
              <div className="flex gap-1">
                {!r.isActive ? (
                  <Button size="sm" variant="ghost" onClick={() => mutations.activateUser.mutate(r.id)}>Activate</Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => mutations.suspendUser.mutate({ id: r.id })}>Suspend</Button>
                )}
              </div>
            ),
          },
        ]}
        rows={users}
      />

      <AdminPagination pagination={pagination} onPageChange={(page) => setParams((p) => ({ ...p, page }))} />
    </div>
  );
}
