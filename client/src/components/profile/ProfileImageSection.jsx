import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import { Loader } from '@/components/common';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { setUser } from '@/features/auth/authSlice';
import { PROFILE_QUERY_KEY } from '@/hooks/useProfile';
import { authApi } from '@/lib/api/auth';
import { cn } from '@/lib/utils';

export function ProfileImageSection({ user }) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const response = await authApi.uploadAvatar(file);
      const updatedUser = response.data.user;

      dispatch(setUser(updatedUser));

      queryClient.setQueryData(PROFILE_QUERY_KEY, (old) => {
        if (!old?.data) return old;
        return { ...old, data: { ...old.data, user: updatedUser } };
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Image</CardTitle>
        <CardDescription>Upload a professional photo via Cloudinary (max 5MB)</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <div
          className={cn(
            'relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-muted text-3xl font-bold text-muted-foreground ring-2 ring-border',
          )}
        >
          {loading ? (
            <Loader size="sm" />
          ) : user?.avatar?.url ? (
            <img
              key={user.avatar.url}
              src={user.avatar.url}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            user?.firstName?.[0]?.toUpperCase()
          )}
        </div>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={loading}>
            {loading ? 'Uploading...' : 'Change photo'}
          </Button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
