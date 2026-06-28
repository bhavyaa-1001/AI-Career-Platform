import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

export const uploadAvatar = async (fileBuffer, folder = 'avatars') => {
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, 'Avatar upload is not configured. Set Cloudinary environment variables.');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
      },
      (error, result) => {
        if (error) reject(new ApiError(500, 'Failed to upload avatar'));
        else resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(fileBuffer);
  });
};

export const deleteAvatar = async (publicId) => {
  if (!isCloudinaryConfigured || !publicId) return;
  await cloudinary.uploader.destroy(publicId);
};

export const uploadResumeFile = async (fileBuffer, { fileName, mimeType, folder = 'resumes' }) => {
  if (!isCloudinaryConfigured) {
    return { url: null, publicId: null, skipped: true };
  }

  const isPdf = mimeType === 'application/pdf' || fileName?.toLowerCase().endsWith('.pdf');

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw',
        format: isPdf ? 'pdf' : undefined,
        public_id: fileName?.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 80),
      },
      (error, result) => {
        if (error) reject(new ApiError(500, 'Failed to upload resume file'));
        else resolve({ url: result.secure_url, publicId: result.public_id, skipped: false });
      },
    );
    stream.end(fileBuffer);
  });
};

export const deleteResumeFile = async (publicId) => {
  if (!isCloudinaryConfigured || !publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
};
