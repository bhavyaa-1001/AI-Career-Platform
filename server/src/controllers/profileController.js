import {
  addCertification,
  addEducation,
  addExperience,
  addProject,
  deleteCertification,
  deleteEducation,
  deleteExperience,
  deleteProject,
  discardDraft,
  getFullProfile,
  getPreviewProfile,
  getProfileCompletion,
  publishDraft,
  saveDraft,
  updateCareerPreferences,
  updateCertification,
  updateEducation,
  updateExperience,
  updateLanguages,
  updatePersonalDetails,
  updateProject,
  updateSkills,
} from '../services/profileService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const data = await getFullProfile(req.user._id);
  res.status(200).json({ success: true, data });
});

export const updatePersonal = asyncHandler(async (req, res) => {
  const data = await updatePersonalDetails(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data,
  });
});

export const replaceSkills = asyncHandler(async (req, res) => {
  const profile = await updateSkills(req.user._id, req.body.skills);
  res.status(200).json({
    success: true,
    message: 'Skills updated successfully',
    data: { profile },
  });
});

export const createEducation = asyncHandler(async (req, res) => {
  const profile = await addEducation(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Education added successfully',
    data: { profile },
  });
});

export const editEducation = asyncHandler(async (req, res) => {
  const profile = await updateEducation(req.user._id, req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Education updated successfully',
    data: { profile },
  });
});

export const removeEducation = asyncHandler(async (req, res) => {
  const profile = await deleteEducation(req.user._id, req.params.id);
  res.status(200).json({
    success: true,
    message: 'Education removed successfully',
    data: { profile },
  });
});

export const createExperience = asyncHandler(async (req, res) => {
  const profile = await addExperience(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Experience added successfully',
    data: { profile },
  });
});

export const editExperience = asyncHandler(async (req, res) => {
  const profile = await updateExperience(req.user._id, req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Experience updated successfully',
    data: { profile },
  });
});

export const removeExperience = asyncHandler(async (req, res) => {
  const profile = await deleteExperience(req.user._id, req.params.id);
  res.status(200).json({
    success: true,
    message: 'Experience removed successfully',
    data: { profile },
  });
});

export const createProject = asyncHandler(async (req, res) => {
  const profile = await addProject(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Project added successfully',
    data: { profile },
  });
});

export const editProject = asyncHandler(async (req, res) => {
  const profile = await updateProject(req.user._id, req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Project updated successfully',
    data: { profile },
  });
});

export const removeProject = asyncHandler(async (req, res) => {
  const profile = await deleteProject(req.user._id, req.params.id);
  res.status(200).json({
    success: true,
    message: 'Project removed successfully',
    data: { profile },
  });
});

export const createCertification = asyncHandler(async (req, res) => {
  const profile = await addCertification(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Certification added successfully',
    data: { profile },
  });
});

export const editCertification = asyncHandler(async (req, res) => {
  const profile = await updateCertification(req.user._id, req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Certification updated successfully',
    data: { profile },
  });
});

export const removeCertification = asyncHandler(async (req, res) => {
  const profile = await deleteCertification(req.user._id, req.params.id);
  res.status(200).json({
    success: true,
    message: 'Certification removed successfully',
    data: { profile },
  });
});

export const replaceLanguages = asyncHandler(async (req, res) => {
  const profile = await updateLanguages(req.user._id, req.body.languages);
  res.status(200).json({ success: true, message: 'Languages updated', data: { profile } });
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const profile = await updateCareerPreferences(req.user._id, req.body);
  res.status(200).json({ success: true, message: 'Preferences updated', data: { profile } });
});

export const saveDraftHandler = asyncHandler(async (req, res) => {
  const profile = await saveDraft(req.user._id, req.body);
  res.status(200).json({ success: true, message: 'Draft saved', data: { profile } });
});

export const publishDraftHandler = asyncHandler(async (req, res) => {
  const data = await publishDraft(req.user._id);
  res.status(200).json({ success: true, message: 'Profile published', data });
});

export const discardDraftHandler = asyncHandler(async (req, res) => {
  const profile = await discardDraft(req.user._id);
  res.status(200).json({ success: true, message: 'Draft discarded', data: { profile } });
});

export const previewProfile = asyncHandler(async (req, res) => {
  const data = await getPreviewProfile(req.user._id);
  res.status(200).json({ success: true, data });
});

export const getCompletion = asyncHandler(async (req, res) => {
  const completion = await getProfileCompletion(req.user._id);
  res.status(200).json({ success: true, data: { completion } });
});
