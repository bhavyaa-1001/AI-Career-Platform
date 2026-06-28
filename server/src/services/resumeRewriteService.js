import { ApiError } from '../utils/ApiError.js';

import { logActivity } from './activityService.js';
import { rewriteResumeContent } from './geminiRewriteService.js';
import { getResumeById, updateResume } from './resumeService.js';

export const generateRewrite = async (resumeId, userId, options) => {
  const resume = await getResumeById(resumeId, userId);
  const { mode, itemId, targetRole, targetJobDescription } = options;

  const hasContent = resume.content?.summary?.text
    || resume.content?.experience?.length
    || resume.content?.projects?.length
    || resume.content?.achievements?.length;

  if (!hasContent) {
    throw new ApiError(422, 'Add resume content before using AI rewrite.');
  }

  return rewriteResumeContent({
    mode,
    content: resume.content,
    targetRole,
    targetJobDescription,
    itemId,
  });
};

export const applyRewrite = async (resumeId, userId, { content, versionLabel }) => {
  const label = versionLabel || 'AI rewrite';
  const resume = await updateResume(resumeId, userId, { content }, { autosave: false, versionLabel: label });
  await logActivity(userId, 'profile_update', `AI rewrite applied: ${label}`, { resumeId });
  return resume;
};
