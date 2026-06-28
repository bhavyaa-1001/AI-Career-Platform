import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';

import { Loader } from '@/components/common';
import {
  AccountSettingsSection,
  CareerPreferencesSection,
  CertificationsSection,
  EducationSection,
  ExperienceSection,
  LanguagesSection,
  PersonalDetailsSection,
  ProfileAlert,
  ProfileImageSection,
  ProfileToolbar,
  ProjectsSection,
  SkillsSection,
} from '@/components/profile';
import { Badge } from '@/components/ui';
import { setUser } from '@/features/auth/authSlice';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, PROFILE_QUERY_KEY } from '@/hooks/useProfile';
import { DASHBOARD_QUERY_KEY } from '@/hooks/useDashboard';
import { profileApi } from '@/lib/api/profile';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'personal', label: 'Personal' },
  { id: 'career', label: 'Career' },
  { id: 'education', label: 'Education' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'languages', label: 'Languages' },
  { id: 'projects', label: 'Projects' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'account', label: 'Account' },
];

export function ProfilePage() {
  const { data, isLoading, isError, error, refetch } = useProfile();
  const { user: authUser } = useAuth();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('personal');
  const [message, setMessage] = useState(null);
  const [formError, setFormError] = useState(null);
  const [draftLoading, setDraftLoading] = useState(false);

  const profileUser = data?.data?.user;
  const profile = data?.data?.profile;
  const completion = data?.data?.completion;

  const user = profileUser
    ? { ...profileUser, ...authUser, avatar: authUser?.avatar?.url ? authUser.avatar : profileUser.avatar }
    : authUser;

  const sectionProps = { user, profile, onMessage: setMessage, onError: setFormError };

  const handleSaveDraft = async () => {
    setDraftLoading(true);
    setFormError(null);
    try {
      const draftData = {
        firstName: user?.firstName,
        lastName: user?.lastName,
        phone: profile?.phone,
        location: profile?.location,
        bio: profile?.bio,
        headline: profile?.headline,
        resumeUrl: profile?.resumeUrl,
        github: profile?.github,
        linkedin: profile?.linkedin,
        portfolio: profile?.portfolio,
        preferredRoles: profile?.preferredRoles,
        expectedSalary: profile?.expectedSalary,
        socialLinks: profile?.socialLinks,
        skills: profile?.skills,
        languages: profile?.languages,
      };
      const response = await profileApi.saveDraft(draftData);
      queryClient.setQueryData(PROFILE_QUERY_KEY, (old) => ({
        ...old,
        data: { ...old.data, profile: response.data.profile },
      }));
      setMessage('Draft saved successfully');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setDraftLoading(false);
    }
  };

  const handlePublish = async () => {
    setDraftLoading(true);
    try {
      const response = await profileApi.publishDraft();
      dispatch(setUser(response.data.user));
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      setMessage('Profile published successfully');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setDraftLoading(false);
    }
  };

  const handleDiscard = async () => {
    setDraftLoading(true);
    try {
      const response = await profileApi.discardDraft();
      queryClient.setQueryData(PROFILE_QUERY_KEY, (old) => ({
        ...old,
        data: { ...old.data, profile: response.data.profile },
      }));
      setMessage('Draft discarded');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setDraftLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-destructive">{error.message}</p>
        <button type="button" className="mt-4 text-primary hover:underline" onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Edit Profile</h2>
          <Badge variant="outline" className="capitalize">{user?.role}</Badge>
          {completion && <Badge variant="outline">{completion.percentage}% complete</Badge>}
        </div>

        <ProfileAlert message={message} error={formError} onDismiss={() => { setMessage(null); setFormError(null); }} />
        <ProfileToolbar profile={profile} onSaveDraft={handleSaveDraft} onPublish={handlePublish} onDiscard={handleDiscard} loading={draftLoading} />
        <ProfileImageSection user={user} />

        <div className="mt-8 overflow-x-auto">
          <nav className="flex gap-1 border-b border-border pb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'whitespace-nowrap rounded-t-md px-3 py-2 text-sm font-medium transition-colors sm:px-4',
                  activeTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6 space-y-6">
          {activeTab === 'personal' && <PersonalDetailsSection {...sectionProps} />}
          {activeTab === 'career' && <CareerPreferencesSection {...sectionProps} />}
          {activeTab === 'education' && <EducationSection {...sectionProps} />}
          {activeTab === 'experience' && <ExperienceSection {...sectionProps} />}
          {activeTab === 'skills' && <SkillsSection {...sectionProps} />}
          {activeTab === 'languages' && <LanguagesSection {...sectionProps} />}
          {activeTab === 'projects' && <ProjectsSection {...sectionProps} />}
          {activeTab === 'certifications' && <CertificationsSection {...sectionProps} />}
          {activeTab === 'account' && <AccountSettingsSection {...sectionProps} />}
        </div>
      </motion.div>
    </div>
  );
}
