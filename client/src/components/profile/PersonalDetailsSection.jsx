import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Textarea } from '@/components/ui';
import { setUser } from '@/features/auth/authSlice';
import { PROFILE_QUERY_KEY } from '@/hooks/useProfile';
import { profileApi } from '@/lib/api/profile';

export function PersonalDetailsSection({ user, profile, onMessage, onError }) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      location: '',
      headline: '',
      bio: '',
      resumeUrl: '',
      github: '',
      linkedin: '',
      portfolio: '',
    },
  });

  useEffect(() => {
    if (user && profile) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: profile.phone || '',
        location: profile.location || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        resumeUrl: profile.resumeUrl || '',
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        portfolio: profile.portfolio || '',
      });
    }
  }, [user, profile, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    onError(null);
    onMessage(null);
    try {
      const response = await profileApi.updatePersonal(data);
      dispatch(setUser(response.data.user));
      queryClient.setQueryData(PROFILE_QUERY_KEY, { success: true, data: response.data });
      onMessage('Personal details saved successfully');
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
        <CardDescription>Your basic information and professional links</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="First name" {...register('firstName', { required: 'Required' })} />
            <Input label="Last name" {...register('lastName', { required: 'Required' })} />
          </div>
          <Input label="Email" value={user?.email || ''} disabled />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Phone" placeholder="+1 234 567 8900" {...register('phone')} />
            <Input label="Location" placeholder="City, Country" {...register('location')} />
          </div>
          <Input label="Headline" placeholder="Full Stack Developer | React & Node.js" {...register('headline')} />
          <Textarea label="Bio" placeholder="Tell us about yourself..." {...register('bio')} rows={4} />

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-sm font-medium">Links</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Resume URL" placeholder="https://..." {...register('resumeUrl')} />
              <Input label="Portfolio" placeholder="https://..." {...register('portfolio')} />
              <Input label="GitHub" placeholder="https://github.com/username" {...register('github')} />
              <Input label="LinkedIn" placeholder="https://linkedin.com/in/username" {...register('linkedin')} />
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save personal details'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
