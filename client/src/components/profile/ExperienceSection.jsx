import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Checkbox, Input, Textarea } from '@/components/ui';
import { emptyExperience, formatMonth } from '@/features/profile/constants';
import { profileApi } from '@/lib/api/profile';
import { PROFILE_QUERY_KEY } from '@/hooks/useProfile';
import { useQueryClient } from '@tanstack/react-query';

export function ExperienceSection({ profile, onMessage, onError }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm({ defaultValues: emptyExperience });
  const isCurrent = watch('isCurrent');

  useEffect(() => {
    if (isCurrent) setValue('endDate', '');
  }, [isCurrent, setValue]);

  const updateCache = (response) => {
    queryClient.setQueryData(PROFILE_QUERY_KEY, (old) => ({
      ...old,
      data: { ...old.data, profile: response.data.profile },
    }));
  };

  const openAdd = () => {
    reset(emptyExperience);
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
    reset(emptyExperience);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    onError(null);
    onMessage(null);
    const payload = { ...data, endDate: data.isCurrent ? '' : data.endDate };
    try {
      const response = editingId
        ? await profileApi.updateExperience(editingId, payload)
        : await profileApi.addExperience(payload);
      updateCache(response);
      onMessage(editingId ? 'Experience updated' : 'Experience added');
      closeForm();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this experience entry?')) return;
    setLoading(true);
    try {
      const response = await profileApi.deleteExperience(id);
      updateCache(response);
      onMessage('Experience removed');
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
          <CardTitle>Experience</CardTitle>
          <CardDescription>Your work history</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={openAdd}>
          Add experience
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile?.experience?.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground">No experience added yet.</p>
        )}

        {profile?.experience?.map((item) => (
          <div key={item.id} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-sm text-primary">{item.company}</p>
                <p className="text-xs text-muted-foreground">
                  {item.location && `${item.location} · `}
                  {formatMonth(item.startDate)} — {item.isCurrent ? 'Present' : formatMonth(item.endDate)}
                </p>
                {item.description && <p className="mt-2 whitespace-pre-wrap text-sm">{item.description}</p>}
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
              <Input label="Job title" {...register('title', { required: 'Required' })} />
              <Input label="Company" {...register('company', { required: 'Required' })} />
              <Input label="Location" {...register('location')} />
              <div />
              <Input label="Start date" type="month" {...register('startDate')} />
              <Input label="End date" type="month" disabled={isCurrent} {...register('endDate')} />
            </div>
            <Checkbox label="I currently work here" {...register('isCurrent')} />
            <Textarea label="Description" placeholder="Describe your responsibilities and achievements..." {...register('description')} rows={4} />
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
