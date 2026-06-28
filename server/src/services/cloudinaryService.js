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
