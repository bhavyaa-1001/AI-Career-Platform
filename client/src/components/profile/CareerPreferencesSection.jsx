import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Select } from '@/components/ui';
import { PROFILE_QUERY_KEY } from '@/hooks/useProfile';
import { profileApi } from '@/lib/api/profile';

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'INR', label: 'INR (₹)' },
];

const PERIOD_OPTIONS = [
  { value: 'annual', label: 'Annual' },
  { value: 'monthly', label: 'Monthly' },
];

export function CareerPreferencesSection({ profile, onMessage, onError }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { preferredRoles: '', salaryMin: '', salaryMax: '', currency: 'USD', period: 'annual' },
  });

  useEffect(() => {
    if (profile) {
      reset({
        preferredRoles: profile.preferredRoles?.join(', ') || '',
        salaryMin: profile.expectedSalary?.min ?? '',
        salaryMax: profile.expectedSalary?.max ?? '',
        currency: profile.expectedSalary?.currency || 'USD',
        period: profile.expectedSalary?.period || 'annual',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    onError(null);
    onMessage(null);
    const payload = {
      preferredRoles: data.preferredRoles
        ? data.preferredRoles.split(',').map((r) => r.trim()).filter(Boolean)
        : [],
      expectedSalary: {
        min: data.salaryMin ? Number(data.salaryMin) : null,
        max: data.salaryMax ? Number(data.salaryMax) : null,
        currency: data.currency,
        period: data.period,
      },
    };
    try {
      const response = await profileApi.updatePreferences(payload);
      queryClient.setQueryData(PROFILE_QUERY_KEY, (old) => ({
        ...old,
        data: { ...old.data, profile: response.data.profile },
      }));
      onMessage('Career preferences saved');
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Career Preferences</CardTitle>
        <CardDescription>Preferred roles and expected compensation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Preferred roles"
            placeholder="Frontend Developer, Full Stack Engineer (comma separated)"
            {...register('preferredRoles')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Expected salary (min)" type="number" placeholder="50000" {...register('salaryMin')} />
            <Input label="Expected salary (max)" type="number" placeholder="80000" {...register('salaryMax')} />
            <Select label="Currency" options={CURRENCY_OPTIONS} {...register('currency')} />
            <Select label="Period" options={PERIOD_OPTIONS} {...register('period')} />
          </div>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save preferences'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
