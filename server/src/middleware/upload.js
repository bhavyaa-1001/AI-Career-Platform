import multer from 'multer';

import { ApiError } from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const imageFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only JPEG, PNG, WebP, and GIF images are allowed'), false);
  }
};

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const handleMulterError = (err, _req, _res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'File size must not exceed 5MB'));
    }
    return next(new ApiError(400, err.message));
  }
  next(err);
};
