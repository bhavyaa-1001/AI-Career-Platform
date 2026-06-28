import { ZodError } from 'zod';

import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      next(error);
    } else {
      next(new ApiError(400, 'Validation failed'));
    }
  }
};
