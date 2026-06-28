import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui';
import { emptyCertification, formatMonth } from '@/features/profile/constants';
import { profileApi } from '@/lib/api/profile';
import { PROFILE_QUERY_KEY } from '@/hooks/useProfile';
import { useQueryClient } from '@tanstack/react-query';

export function CertificationsSection({ profile, onMessage, onError }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset } = useForm({ defaultValues: emptyCertification });

  const updateCache = (response) => {
    queryClient.setQueryData(PROFILE_QUERY_KEY, (old) => ({
      ...old,
      data: { ...old.data, profile: response.data.profile },
    }));
  };

  const openAdd = () => {
    reset(emptyCertification);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    reset(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset(emptyCertification);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    onError(null);
    onMessage(null);
    try {
      const response = editingId
        ? await profileApi.updateCertification(editingId, data)
        : await profileApi.addCertification(data);
      updateCache(response);
      onMessage(editingId ? 'Certification updated' : 'Certification added');
      closeForm();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this certification?')) return;
    setLoading(true);
    try {
      const response = await profileApi.deleteCertification(id);
      updateCache(response);
      onMessage('Certification removed');
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Certifications</CardTitle>
          <CardDescription>Professional certifications and credentials</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={openAdd}>
          Add certification
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile?.certifications?.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground">No certifications added yet.</p>
        )}

        {profile?.certifications?.map((item) => (
          <div key={item.id} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      {item.name}
                    </a>
                  ) : (
                    item.name
                  )}
                </h4>
                <p className="text-sm text-muted-foreground">{item.issuer}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Issued {formatMonth(item.issueDate)}
                  {item.expiryDate && ` · Expires ${formatMonth(item.expiryDate)}`}
                  {item.credentialId && ` · ID: ${item.credentialId}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} disabled={loading}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}

        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-primary/30 bg-accent/30 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Certification name" {...register('name', { required: 'Required' })} />
              <Input label="Issuing organization" {...register('issuer', { required: 'Required' })} />
              <Input label="Issue date" type="month" {...register('issueDate')} />
              <Input label="Expiry date" type="month" {...register('expiryDate')} />
              <Input label="Credential ID" {...register('credentialId')} />
              <Input label="Credential URL" placeholder="https://..." {...register('url')} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update' : 'Add'}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
