import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Textarea } from '@/components/ui';
import { emptyProject, formatMonth } from '@/features/profile/constants';
import { profileApi } from '@/lib/api/profile';
import { PROFILE_QUERY_KEY } from '@/hooks/useProfile';
import { useQueryClient } from '@tanstack/react-query';

export function ProjectsSection({ profile, onMessage, onError }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset } = useForm({ defaultValues: emptyProject });

  const updateCache = (response) => {
    queryClient.setQueryData(PROFILE_QUERY_KEY, (old) => ({
      ...old,
      data: { ...old.data, profile: response.data.profile },
    }));
  };

  const openAdd = () => {
    reset(emptyProject);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    reset({
      ...item,
      technologies: Array.isArray(item.technologies) ? item.technologies.join(', ') : '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset(emptyProject);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    onError(null);
    onMessage(null);
    const payload = {
      ...data,
      technologies: data.technologies
        ? data.technologies.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    };
    try {
      const response = editingId
        ? await profileApi.updateProject(editingId, payload)
        : await profileApi.addProject(payload);
      updateCache(response);
      onMessage(editingId ? 'Project updated' : 'Project added');
      closeForm();
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this project?')) return;
    setLoading(true);
    try {
      const response = await profileApi.deleteProject(id);
      updateCache(response);
      onMessage('Project removed');
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
          <CardTitle>Projects</CardTitle>
          <CardDescription>Showcase your work and side projects</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={openAdd}>
          Add project
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile?.projects?.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground">No projects added yet.</p>
        )}

        {profile?.projects?.map((item) => (
          <div key={item.id} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-semibold">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {formatMonth(item.startDate)}
                  {item.endDate && ` — ${formatMonth(item.endDate)}`}
                </p>
                {item.description && <p className="mt-2 text-sm">{item.description}</p>}
                {item.technologies?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.technologies.map((tech) => (
                      <Badge key={tech} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
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
            <Input label="Project title" {...register('title', { required: 'Required' })} />
            <Input label="Project URL" placeholder="https://..." {...register('url')} />
            <Input label="Technologies" placeholder="React, Node.js, MongoDB (comma separated)" {...register('technologies')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Start date" type="month" {...register('startDate')} />
              <Input label="End date" type="month" {...register('endDate')} />
            </div>
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
