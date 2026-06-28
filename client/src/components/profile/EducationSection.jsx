import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Checkbox, Input, Textarea } from '@/components/ui';
import { emptyEducation, formatMonth } from '@/features/profile/constants';
import { profileApi } from '@/lib/api/profile';
import { PROFILE_QUERY_KEY } from '@/hooks/useProfile';
import { useQueryClient } from '@tanstack/react-query';

export function EducationSection({ profile, onMessage, onError }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm({ defaultValues: emptyEducation });
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
    reset(emptyEducation);
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
    reset(emptyEducation);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    onError(null);
    onMessage(null);
    const payload = { ...data, endDate: data.isCurrent ? '' : data.endDate };
    try {
      const response = editingId
        ? await profileApi.updateEducation(editingId, payload)
        : await profileApi.addEducation(payload);
      updateCache(response);
      onMessage(editingId ? 'Education updated' : 'Education added');
      closeForm();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this education entry?')) return;
    setLoading(true);
    try {
      const response = await profileApi.deleteEducation(id);
      updateCache(response);
      onMessage('Education removed');
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
          <CardTitle>Education</CardTitle>
          <CardDescription>Your academic background</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={openAdd}>
          Add education
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile?.education?.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground">No education added yet.</p>
        )}

        {profile?.education?.map((item) => (
          <div key={item.id} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold">{item.institution}</h4>
                <p className="text-sm text-muted-foreground">
                  {item.degree}
                  {item.fieldOfStudy && ` · ${item.fieldOfStudy}`}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatMonth(item.startDate)} — {item.isCurrent ? 'Present' : formatMonth(item.endDate)}
                  {item.grade && ` · ${item.grade}`}
                </p>
                {item.description && <p className="mt-2 text-sm">{item.description}</p>}
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
              <Input label="Institution" {...register('institution', { required: 'Required' })} />
              <Input label="Degree" {...register('degree', { required: 'Required' })} />
              <Input label="Field of study" {...register('fieldOfStudy')} />
              <Input label="Grade / GPA" {...register('grade')} />
              <Input label="Start date" type="month" {...register('startDate')} />
              <Input label="End date" type="month" disabled={isCurrent} {...register('endDate')} />
            </div>
            <Checkbox label="I currently study here" {...register('isCurrent')} />
            <Textarea label="Description" {...register('description')} rows={3} />
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
