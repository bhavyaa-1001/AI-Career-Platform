import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { AdminPageHeader, AdminTable, RoleBadge, StatusBadge } from '@/components/admin/AdminComponents';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select } from '@/components/ui';
import { getAssignableRoleOptions, ROLE_LABELS } from '@/features/admin/constants';
import { useAuth } from '@/hooks/useAuth';
import { useAdminUser, useAdminUserMutations } from '@/hooks/useAdmin';

const PRIVILEGED_ROLES = ['admin', 'sub_admin'];

export function AdminUserDetailPage() {
  const { id } = useParams();
  const { isFullAdmin } = useAuth();
  const { data, isLoading, refetch } = useAdminUser(id);
  const mutations = useAdminUserMutations();
  const [newPassword, setNewPassword] = useState('');
  const [roleError, setRoleError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  if (isLoading) return <Loader className="py-20" />;

  const { user, meta, loginHistory, aiUsage, aiStats, activities } = data?.data || {};

  if (!user) return <p className="text-destructive">User not found</p>;

  const assignableRoles = getAssignableRoleOptions(isFullAdmin);
  const canModifyUser = isFullAdmin || !PRIVILEGED_ROLES.includes(user.role);
  const currentRole = selectedRole || user.role;

  const handleAssignRole = async () => {
    if (currentRole === user.role) return;
    setRoleError(null);
    try {
      await mutations.assignRole.mutateAsync({ id, role: currentRole });
      setSelectedRole('');
      refetch();
    } catch (err) {
      setRoleError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`${user.firstName} ${user.lastName}`}
        description={user.email}
        actions={
          canModifyUser ? (
            <>
              <Link to="/admin/users"><Button variant="outline" size="sm">← Back</Button></Link>
              {!user.isActive ? (
                <Button size="sm" onClick={() => mutations.activateUser.mutate(id)}>Activate</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => mutations.suspendUser.mutate({ id })}>Suspend</Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => mutations.banUser.mutate({ id })}>Ban</Button>
            </>
          ) : (
            <Link to="/admin/users"><Button variant="outline" size="sm">← Back</Button></Link>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Role</p><div className="mt-1"><RoleBadge role={user.role} /></div></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Status</p><div className="mt-1"><StatusBadge status={user.isActive ? 'active' : 'inactive'} variant={user.isActive ? 'active' : 'inactive'} /></div></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Email Verified</p><p className="mt-1 font-medium">{user.isEmailVerified ? 'Yes' : 'No'}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Last Login</p><p className="mt-1 font-medium">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Login History</CardTitle></CardHeader>
          <CardContent>
            <AdminTable
              columns={[
                { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleString() },
                { key: 'ip', label: 'IP' },
                { key: 'success', label: 'Success', render: (r) => r.success ? '✓' : '✗' },
              ]}
              rows={loginHistory || []}
              emptyMessage="No login history"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">AI Usage</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              {(aiStats || []).map((s) => (
                <Badge key={s.feature} variant="outline">{s.feature}: {s.count}</Badge>
              ))}
            </div>
            <AdminTable
              columns={[
                { key: 'feature', label: 'Feature' },
                { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleString() },
                { key: 'success', label: 'OK', render: (r) => r.success ? '✓' : '✗' },
              ]}
              rows={aiUsage || []}
              emptyMessage="No AI usage recorded"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Activity</CardTitle></CardHeader>
          <CardContent>
            <AdminTable
              columns={[
                { key: 'action', label: 'Action' },
                { key: 'description', label: 'Description' },
                { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleString() },
              ]}
              rows={activities || []}
              emptyMessage="No activity"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Role & Access</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Current Role</p>
              <RoleBadge role={user.role} />
            </div>

            {canModifyUser ? (
              <div>
                <p className="mb-2 text-sm font-medium">Change Role</p>
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={currentRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    options={assignableRoles}
                    className="min-w-[160px]"
                  />
                  <Button
                    size="sm"
                    onClick={handleAssignRole}
                    disabled={currentRole === user.role || mutations.assignRole.isPending}
                  >
                    {mutations.assignRole.isPending ? 'Saving...' : 'Update Role'}
                  </Button>
                </div>
                {roleError && <p className="mt-2 text-sm text-destructive">{roleError}</p>}
                {!isFullAdmin && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Sub-admins can assign Student or Recruiter roles only.
                  </p>
                )}
                {isFullAdmin && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Full admins can promote users to Sub Admin or Admin.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Only full admins can change roles for {ROLE_LABELS[user.role]} accounts.
              </p>
            )}

            {canModifyUser && (
              <div>
                <p className="mb-2 text-sm font-medium">Reset Password</p>
                <div className="flex gap-2">
                  <Input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <Button size="sm" disabled={newPassword.length < 8} onClick={() => { mutations.resetPassword.mutate({ id, newPassword }); setNewPassword(''); }}>Reset</Button>
                </div>
              </div>
            )}

            {meta?.adminNotes && <p className="text-sm text-muted-foreground">Notes: {meta.adminNotes}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
