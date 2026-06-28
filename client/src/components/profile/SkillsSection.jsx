import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Select } from '@/components/ui';
import { PROFICIENCY_OPTIONS } from '@/features/profile/constants';
import { profileApi } from '@/lib/api/profile';
import { PROFILE_QUERY_KEY } from '@/hooks/useProfile';
import { useQueryClient } from '@tanstack/react-query';

export function SkillsSection({ profile, onMessage, onError }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: { skills: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'skills' });

  useEffect(() => {
    if (profile?.skills) {
      reset({ skills: profile.skills.length ? profile.skills : [{ name: '', proficiency: 'intermediate' }] });
    }
  }, [profile, reset]);

  const onSubmit = async (data) => {
    const skills = data.skills.filter((s) => s.name.trim());
    setLoading(true);
    onError(null);
    onMessage(null);
    try {
      const response = await profileApi.updateSkills(skills);
      queryClient.setQueryData(PROFILE_QUERY_KEY, (old) => ({
        ...old,
        data: { ...old.data, profile: response.data.profile },
      }));
      onMessage('Skills updated successfully');
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>Add your technical and professional skills</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Input
                    label={index === 0 ? 'Skill name' : undefined}
                    placeholder="e.g. React, Node.js, Python"
                    {...register(`skills.${index}.name`)}
                  />
                </div>
                <div className="w-full sm:w-44">
                  <Select
                    label={index === 0 ? 'Proficiency' : undefined}
                    options={PROFICIENCY_OPTIONS}
                    {...register(`skills.${index}.proficiency`)}
                  />
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} disabled={fields.length === 1}>
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => append({ name: '', proficiency: 'intermediate' })}>
              Add skill
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save skills'}
            </Button>
          </div>

          {profile?.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              {profile.skills.map((skill) => (
                <Badge key={skill.id} variant="outline" className="capitalize">
                  {skill.name} · {skill.proficiency}
                </Badge>
              ))}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
