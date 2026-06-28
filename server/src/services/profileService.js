import { Profile } from '../models/Profile.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { calculateProfileCompletion } from '../utils/profileCompletion.js';

import { logActivity } from './activityService.js';
import { createNotification } from './notificationService.js';
const getOrCreateProfile = async (userId) => {
  let profile = await Profile.findOne({ userId });
  if (!profile) {
    profile = await Profile.create({ userId });
  }
  return profile;
};

const findSubdocument = (profile, section, itemId) => {
  const item = profile[section].id(itemId);
  if (!item) {
    throw new ApiError(404, `${section.slice(0, -1)} entry not found`);
  }
  return item;
};

export const getFullProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const profile = await getOrCreateProfile(userId);

  const completion = calculateProfileCompletion(user.toSafeObject(), profile.toSafeObject());

  return {
    user: user.toSafeObject(),
    profile: profile.toSafeObject(),
    completion,
  };
};

export const updatePersonalDetails = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const {
    firstName,
    lastName,
    phone,
    location,
    bio,
    headline,
    resumeUrl,
    github,
    linkedin,
    portfolio,
    preferredRoles,
    expectedSalary,
    socialLinks,
  } = data;

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  await user.save();

  const profile = await getOrCreateProfile(userId);

  if (phone !== undefined) profile.phone = phone;
  if (location !== undefined) profile.location = location;
  if (bio !== undefined) profile.bio = bio;
  if (headline !== undefined) profile.headline = headline;
  if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl;
  if (github !== undefined) profile.github = github;
  if (linkedin !== undefined) profile.linkedin = linkedin;
  if (portfolio !== undefined) profile.portfolio = portfolio;
  if (preferredRoles !== undefined) profile.preferredRoles = preferredRoles;
  if (expectedSalary !== undefined) profile.expectedSalary = expectedSalary;
  if (socialLinks !== undefined) profile.socialLinks = { ...profile.socialLinks?.toObject?.() || profile.socialLinks, ...socialLinks };

  await profile.save();

  await logActivity(userId, 'profile_update', 'Updated personal details');
  if (calculateProfileCompletion(user.toSafeObject(), profile.toSafeObject()).percentage >= 80) {
    await createNotification(userId, {
      type: 'achievement',
      title: 'Profile almost complete!',
      message: 'Your profile is 80%+ complete. Great progress!',
      link: '/profile',
    });
  }

  return {
    user: user.toSafeObject(),
    profile: profile.toSafeObject(),
  };
};

export const updateSkills = async (userId, skills) => {
  const profile = await getOrCreateProfile(userId);
  profile.skills = skills;
  await profile.save();
  return profile.toSafeObject();
};

export const addEducation = async (userId, data) => {
  const profile = await getOrCreateProfile(userId);
  profile.education.push(data);
  await profile.save();
  return profile.toSafeObject();
};

export const updateEducation = async (userId, itemId, data) => {
  const profile = await getOrCreateProfile(userId);
  const item = findSubdocument(profile, 'education', itemId);
  Object.assign(item, data);
  await profile.save();
  return profile.toSafeObject();
};

export const deleteEducation = async (userId, itemId) => {
  const profile = await getOrCreateProfile(userId);
  const item = profile.education.id(itemId);
  if (!item) throw new ApiError(404, 'Education entry not found');
  item.deleteOne();
  await profile.save();
  return profile.toSafeObject();
};

export const addExperience = async (userId, data) => {
  const profile = await getOrCreateProfile(userId);
  profile.experience.push(data);
  await profile.save();
  return profile.toSafeObject();
};

export const updateExperience = async (userId, itemId, data) => {
  const profile = await getOrCreateProfile(userId);
  const item = findSubdocument(profile, 'experience', itemId);
  Object.assign(item, data);
  await profile.save();
  return profile.toSafeObject();
};

export const deleteExperience = async (userId, itemId) => {
  const profile = await getOrCreateProfile(userId);
  const item = profile.experience.id(itemId);
  if (!item) throw new ApiError(404, 'Experience entry not found');
  item.deleteOne();
  await profile.save();
  return profile.toSafeObject();
};

export const addProject = async (userId, data) => {
  const profile = await getOrCreateProfile(userId);
  profile.projects.push(data);
  await profile.save();
  return profile.toSafeObject();
};

export const updateProject = async (userId, itemId, data) => {
  const profile = await getOrCreateProfile(userId);
  const item = findSubdocument(profile, 'projects', itemId);
  Object.assign(item, data);
  await profile.save();
  return profile.toSafeObject();
};

export const deleteProject = async (userId, itemId) => {
  const profile = await getOrCreateProfile(userId);
  const item = profile.projects.id(itemId);
  if (!item) throw new ApiError(404, 'Project not found');
  item.deleteOne();
  await profile.save();
  return profile.toSafeObject();
};

export const addCertification = async (userId, data) => {
  const profile = await getOrCreateProfile(userId);
  profile.certifications.push(data);
  await profile.save();
  return profile.toSafeObject();
};

export const updateCertification = async (userId, itemId, data) => {
  const profile = await getOrCreateProfile(userId);
  const item = findSubdocument(profile, 'certifications', itemId);
  Object.assign(item, data);
  await profile.save();
  return profile.toSafeObject();
};

export const deleteCertification = async (userId, itemId) => {
  const profile = await getOrCreateProfile(userId);
  const item = profile.certifications.id(itemId);
  if (!item) throw new ApiError(404, 'Certification not found');
  item.deleteOne();
  await profile.save();
  return profile.toSafeObject();
};

export const updateLanguages = async (userId, languages) => {
  const profile = await getOrCreateProfile(userId);
  profile.languages = languages;
  await profile.save();
  await logActivity(userId, 'profile_update', 'Updated languages');
  return profile.toSafeObject();
};

export const updateCareerPreferences = async (userId, data) => {
  const profile = await getOrCreateProfile(userId);
  if (data.preferredRoles !== undefined) profile.preferredRoles = data.preferredRoles;
  if (data.expectedSalary !== undefined) profile.expectedSalary = data.expectedSalary;
  await profile.save();
  await logActivity(userId, 'profile_update', 'Updated career preferences');
  return profile.toSafeObject();
};

const DRAFT_FIELDS = [
  'phone', 'location', 'bio', 'headline', 'resumeUrl', 'github', 'linkedin', 'portfolio',
  'preferredRoles', 'expectedSalary', 'socialLinks', 'skills', 'languages',
];

const applyDraftFields = (profile, draft) => {
  DRAFT_FIELDS.forEach((field) => {
    if (draft[field] !== undefined) profile[field] = draft[field];
  });
  if (draft.firstName || draft.lastName) {
    return { firstName: draft.firstName, lastName: draft.lastName };
  }
  return null;
};

export const saveDraft = async (userId, draftData) => {
  const profile = await getOrCreateProfile(userId);
  profile.draft = draftData;
  profile.hasDraft = true;
  profile.lastDraftSavedAt = new Date();
  await profile.save();
  await logActivity(userId, 'profile_draft', 'Saved profile draft');
  return profile.toSafeObject();
};

export const publishDraft = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const profile = await getOrCreateProfile(userId);
  if (!profile.hasDraft || !profile.draft) {
    throw new ApiError(400, 'No draft to publish');
  }

  const nameUpdate = applyDraftFields(profile, profile.draft);
  if (nameUpdate?.firstName) user.firstName = nameUpdate.firstName;
  if (nameUpdate?.lastName) user.lastName = nameUpdate.lastName;
  await user.save();

  profile.draft = null;
  profile.hasDraft = false;
  profile.isPublished = true;
  await profile.save();

  await logActivity(userId, 'profile_publish', 'Published profile');
  await createNotification(userId, {
    type: 'profile',
    title: 'Profile published',
    message: 'Your profile changes are now live.',
    link: '/profile/preview',
  });

  return { user: user.toSafeObject(), profile: profile.toSafeObject() };
};

export const discardDraft = async (userId) => {
  const profile = await getOrCreateProfile(userId);
  profile.draft = null;
  profile.hasDraft = false;
  await profile.save();
  return profile.toSafeObject();
};

export const getPreviewProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const profile = await getOrCreateProfile(userId);
  const userObj = user.toSafeObject();
  let profileObj = profile.toSafeObject();

  if (profile.hasDraft && profile.draft) {
    const draft = profile.draft;
    profileObj = {
      ...profileObj,
      ...draft,
      socialLinks: { ...profileObj.socialLinks, ...draft.socialLinks },
    };
    if (draft.firstName) userObj.firstName = draft.firstName;
    if (draft.lastName) userObj.lastName = draft.lastName;
  }

  return {
    user: userObj,
    profile: profileObj,
    isPreview: profile.hasDraft,
    completion: calculateProfileCompletion(userObj, profileObj),
  };
};

export const getProfileCompletion = async (userId) => {
  const { user, profile } = await getFullProfile(userId);
  return calculateProfileCompletion(user, profile);
};
