export const calculateProfileCompletion = (user, profile) => {
  const checks = [
    { key: 'avatar', label: 'Profile photo', weight: 10, done: Boolean(user?.avatar?.url) },
    { key: 'name', label: 'Full name', weight: 5, done: Boolean(user?.firstName && user?.lastName) },
    { key: 'bio', label: 'Bio', weight: 10, done: Boolean(profile?.bio?.trim()) },
    { key: 'headline', label: 'Headline', weight: 5, done: Boolean(profile?.headline?.trim()) },
    { key: 'location', label: 'Location', weight: 5, done: Boolean(profile?.location?.trim()) },
    { key: 'skills', label: 'Skills', weight: 15, done: profile?.skills?.length > 0 },
    { key: 'experience', label: 'Experience', weight: 15, done: profile?.experience?.length > 0 },
    { key: 'education', label: 'Education', weight: 10, done: profile?.education?.length > 0 },
    { key: 'projects', label: 'Projects', weight: 10, done: profile?.projects?.length > 0 },
    { key: 'links', label: 'Social links', weight: 5, done: Boolean(profile?.github || profile?.linkedin || profile?.portfolio) },
    { key: 'roles', label: 'Preferred roles', weight: 5, done: profile?.preferredRoles?.length > 0 },
    { key: 'salary', label: 'Expected salary', weight: 5, done: Boolean(profile?.expectedSalary?.min || profile?.expectedSalary?.max) },
    { key: 'languages', label: 'Languages', weight: 5, done: profile?.languages?.length > 0 },
    { key: 'email', label: 'Email verified', weight: 5, done: Boolean(user?.isEmailVerified) },
  ];

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.filter((c) => c.done).reduce((sum, c) => sum + c.weight, 0);
  const percentage = Math.round((earned / totalWeight) * 100);

  return {
    percentage,
    checks,
    completedCount: checks.filter((c) => c.done).length,
    totalCount: checks.length,
  };
};
