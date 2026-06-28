import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AdminPageHeader, AdminTable, StatusBadge } from '@/components/admin/AdminComponents';
import { Loader } from '@/components/common';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from '@/components/ui';
import { adminApi } from '@/lib/api/admin';
import { useAdminBroadcasts } from '@/hooks/useAdmin';

export function AdminNotificationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', channels: ['in_app'], targetRoles: [], sendNow: false });
  const { data, isLoading } = useAdminBroadcasts({ page: 1, limit: 20 });
  const qc = useQueryClient();

  const createMut = useMutation({
    mutationFn: adminApi.createBroadcast,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'broadcasts'] }); setShowForm(false); },
  });
  const sendMut = useMutation({
    mutationFn: adminApi.sendBroadcast,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'broadcasts'] }),
  });

  if (isLoading) return <Loader className="py-20" />;

  const broadcasts = data?.data?.broadcasts || [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notifications"
        description="Broadcast in-app, email, and push notifications"
        actions={<Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'New Broadcast'}</Button>}
      />

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Broadcast</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} />
            <div className="flex flex-wrap gap-3 text-sm">
              {['in_app', 'email', 'push'].map((ch) => (
                <label key={ch} className="flex items-center gap-1">
                  <input type="checkbox" checked={form.channels.includes(ch)} onChange={(e) => {
                    setForm({ ...form, channels: e.target.checked ? [...form.channels, ch] : form.channels.filter((c) => c !== ch) });
                  }} />
                  {ch}
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {['student', 'recruiter', 'sub_admin', 'admin'].map((role) => (
                <label key={role} className="flex items-center gap-1">
                  <input type="checkbox" checked={form.targetRoles.includes(role)} onChange={(e) => {
                    setForm({ ...form, targetRoles: e.target.checked ? [...form.targetRoles, role] : form.targetRoles.filter((r) => r !== role) });
                  }} />
                  {role}
                </label>
              ))}
              <span className="text-muted-foreground">(empty = all)</span>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.sendNow} onChange={(e) => setForm({ ...form, sendNow: e.target.checked })} />
              Send immediately
            </label>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.title || !form.message}>Create</Button>
          </CardContent>
        </Card>
      )}

      <AdminTable
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'channels', label: 'Channels', render: (r) => r.channels?.join(', ') },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} variant={r.status === 'sent' ? 'active' : 'pending'} /> },
          { key: 'recipientCount', label: 'Recipients' },
          { key: 'sentAt', label: 'Sent', render: (r) => r.sentAt ? new Date(r.sentAt).toLocaleString() : '—' },
          { key: 'actions', label: '', render: (r) => r.status !== 'sent' && (
            <Button size="sm" onClick={() => sendMut.mutate(r.id)}>Send Now</Button>
          )},
        ]}
        rows={broadcasts}
      />
    </div>
  );
}
