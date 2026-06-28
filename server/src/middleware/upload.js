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

const resumeFilter = (_req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
  ];
  const name = file.originalname?.toLowerCase() || '';
  const byExt = name.endsWith('.pdf') || name.endsWith('.docx');

  if (byExt || allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only PDF and DOCX files are allowed'), false);
  }
};

export const uploadResume = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: resumeFilter,
});

const attachmentFilter = (_req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  const name = file.originalname?.toLowerCase() || '';
  const byExt = name.endsWith('.pdf') || name.endsWith('.docx') || name.match(/\.(jpe?g|png|webp)$/);

  if (byExt || allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only PDF, DOCX, and image files are allowed'), false);
  }
};

export const uploadAttachment = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: attachmentFilter,
});

export const handleMulterError = (err, _req, _res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const max = _req?.originalUrl?.includes('/import/') ? '10MB' : '5MB';
      return next(new ApiError(400, `File size must not exceed ${max}`));
    }
    return next(new ApiError(400, err.message));
  }
  next(err);
};
