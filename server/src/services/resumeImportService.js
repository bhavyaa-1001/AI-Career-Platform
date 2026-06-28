import { logActivity } from './activityService.js';
import { uploadResumeFile } from './cloudinaryService.js';
import { parseResumeFile } from './resumeParserService.js';
import { createResume } from './resumeService.js';

export const parseUploadedResume = async (file) => {
  const parsed = await parseResumeFile(file);

  const upload = await uploadResumeFile(file.buffer, {
    fileName: file.originalname,
    mimeType: file.mimetype,
  });

  return {
    content: parsed.content,
    stats: parsed.stats,
    rawTextPreview: parsed.rawTextPreview,
    rawTextLength: parsed.rawTextLength,
    fileType: parsed.fileType,
    importMeta: {
      sourceFileName: file.originalname,
      sourceFileType: parsed.fileType,
      sourceFileUrl: upload.url,
      sourceFilePublicId: upload.publicId,
    },
  };
};

export const saveImportedResume = async (userId, data) => {
  const title =
    data.title ||
    (data.importMeta?.sourceFileName
      ? `Imported - ${data.importMeta.sourceFileName.replace(/\.[^.]+$/, '')}`
      : 'Imported Resume');

  const resume = await createResume(userId, {
    title,
    template: data.template || 'modern',
    content: data.content,
    importMeta: {
      sourceFileName: data.importMeta?.sourceFileName || null,
      sourceFileType: data.importMeta?.sourceFileType || null,
      sourceFileUrl: data.importMeta?.sourceFileUrl || null,
      sourceFilePublicId: data.importMeta?.sourceFilePublicId || null,
      importedAt: new Date(),
    },
  });

  await logActivity(userId, 'profile_update', `Imported resume: ${title}`, {
    resumeId: resume.id,
    source: data.importMeta?.sourceFileType,
  });

  return resume;
};
