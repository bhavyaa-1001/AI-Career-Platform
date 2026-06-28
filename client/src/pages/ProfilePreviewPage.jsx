import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import { Loader } from '@/components/common';
import { Avatar, Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatMonth, PROFICIENCY_OPTIONS } from '@/features/profile/constants';
import { profileApi } from '@/lib/api/profile';

export function ProfilePreviewPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['profile', 'preview'],
    queryFn: profileApi.getPreview,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-destructive">{error.message}</p>;
  }

  const { user, profile, isPreview } = data.data;
  const proficiencyLabel = (val) => PROFICIENCY_OPTIONS.find((p) => p.value === val)?.label || val;

  return (
    <div className="mx-auto max-w-4xl">
      {isPreview && (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          Preview mode — showing {profile.hasDraft ? 'draft' : 'published'} version
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
            <Avatar src={user?.avatar?.url} name={user?.firstName} size="xl" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{user?.firstName} {user?.lastName}</h1>
              {profile?.headline && <p className="mt-1 text-lg text-primary">{profile.headline}</p>}
              {profile?.location && <p className="mt-1 text-sm text-muted-foreground">{profile.location}</p>}
              {profile?.bio && <p className="mt-3 text-muted-foreground">{profile.bio}</p>}
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                {profile?.github && <a href={profile.github} target="_blank" rel="noopener noreferrer"><Badge variant="outline">GitHub</Badge></a>}
                {profile?.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Badge variant="outline">LinkedIn</Badge></a>}
                {profile?.portfolio && <a href={profile.portfolio} target="_blank" rel="noopener noreferrer"><Badge variant="outline">Portfolio</Badge></a>}
                {profile?.resumeUrl && <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer"><Badge variant="outline">Resume</Badge></a>}
              </div>
            </div>
            <Link to="/profile">
              <Button variant="outline">Edit Profile</Button>
            </Link>
          </CardContent>
        </Card>

        {profile?.skills?.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <Badge key={s.id} variant="outline">{s.name} · {proficiencyLabel(s.proficiency)}</Badge>
              ))}
            </CardContent>
          </Card>
        )}

        {profile?.experience?.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Experience</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {profile.experience.map((e) => (
                <div key={e.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <h3 className="font-semibold">{e.title}</h3>
                  <p className="text-sm text-primary">{e.company}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMonth(e.startDate)} — {e.isCurrent ? 'Present' : formatMonth(e.endDate)}
                  </p>
                  {e.description && <p className="mt-2 whitespace-pre-wrap text-sm">{e.description}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {profile?.education?.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Education</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {profile.education.map((e) => (
                <div key={e.id}>
                  <h3 className="font-semibold">{e.institution}</h3>
                  <p className="text-sm text-muted-foreground">{e.degree}{e.fieldOfStudy && ` · ${e.fieldOfStudy}`}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {profile?.preferredRoles?.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Preferred Roles</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.preferredRoles.map((role) => <Badge key={role} variant="outline">{role}</Badge>)}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
