import { Router } from 'express';

import {
  createCertification,
  createEducation,
  createExperience,
  createProject,
  discardDraftHandler,
  editCertification,
  editEducation,
  editExperience,
  editProject,
  getCompletion,
  getProfile,
  previewProfile,
  publishDraftHandler,
  removeCertification,
  removeEducation,
  removeExperience,
  removeProject,
  replaceLanguages,
  replaceSkills,
  saveDraftHandler,
  updatePersonal,
  updatePreferences,
} from '../../controllers/profileController.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  careerPreferencesSchema,
  certificationSchema,
  draftSchema,
  educationSchema,
  experienceSchema,
  itemIdSchema,
  languagesSchema,
  personalDetailsSchema,
  projectSchema,
  skillsSchema,
  updateCertificationSchema,
  updateEducationSchema,
  updateExperienceSchema,
  updateProjectSchema,
} from '../../validators/profileValidator.js';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);
router.get('/completion', getCompletion);
router.get('/preview', previewProfile);
router.patch('/personal', validate(personalDetailsSchema), updatePersonal);
router.put('/skills', validate(skillsSchema), replaceSkills);
router.put('/languages', validate(languagesSchema), replaceLanguages);
router.patch('/preferences', validate(careerPreferencesSchema), updatePreferences);
router.patch('/draft', validate(draftSchema), saveDraftHandler);
router.post('/publish', publishDraftHandler);
router.delete('/draft', discardDraftHandler);

router.post('/education', validate(educationSchema), createEducation);
router.patch('/education/:id', validate(updateEducationSchema), editEducation);
router.delete('/education/:id', validate(itemIdSchema), removeEducation);

router.post('/experience', validate(experienceSchema), createExperience);
router.patch('/experience/:id', validate(updateExperienceSchema), editExperience);
router.delete('/experience/:id', validate(itemIdSchema), removeExperience);

router.post('/projects', validate(projectSchema), createProject);
router.patch('/projects/:id', validate(updateProjectSchema), editProject);
router.delete('/projects/:id', validate(itemIdSchema), removeProject);

router.post('/certifications', validate(certificationSchema), createCertification);
router.patch('/certifications/:id', validate(updateCertificationSchema), editCertification);
router.delete('/certifications/:id', validate(itemIdSchema), removeCertification);

export default router;
