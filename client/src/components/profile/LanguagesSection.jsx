import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Select } from '@/components/ui';
import { LANGUAGE_PROFICIENCY_OPTIONS } from '@/features/profile/constants';
import { PROFILE_QUERY_KEY } from '@/hooks/useProfile';
import { profileApi } from '@/lib/api/profile';

export function LanguagesSection({ profile, onMessage, onError }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { register, control, handleSubmit, reset } = useForm({ defaultValues: { languages: [] } });
  const { fields, append, remove } = useFieldArray({ control, name: 'languages' });

  useEffect(() => {
    if (profile?.languages) {
      reset({
        languages: profile.languages.length
          ? profile.languages
          : [{ name: '', proficiency: 'conversational' }],
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data) => {
    const languages = data.languages.filter((l) => l.name.trim());
    setLoading(true);
    onError(null);
    onMessage(null);
    try {
      const response = await profileApi.updateLanguages(languages);
      queryClient.setQueryData(PROFILE_QUERY_KEY, (old) => ({
        ...old,
        data: { ...old.data, profile: response.data.profile },
      }));
      onMessage('Languages updated successfully');
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Languages</CardTitle>
        <CardDescription>Languages you speak and your proficiency level</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input label={index === 0 ? 'Language' : undefined} placeholder="e.g. English" {...register(`languages.${index}.name`)} />
              </div>
              <div className="w-full sm:w-44">
                <Select label={index === 0 ? 'Proficiency' : undefined} options={LANGUAGE_PROFICIENCY_OPTIONS} {...register(`languages.${index}.proficiency`)} />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} disabled={fields.length === 1}>Remove</Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => append({ name: '', proficiency: 'conversational' })}>Add language</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save languages'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
