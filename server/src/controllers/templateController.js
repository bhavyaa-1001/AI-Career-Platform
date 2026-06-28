import { getTemplateDefinitions } from '../config/templates.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listTemplates = asyncHandler(async (_req, res) => {
  res.status(200).json({ success: true, data: { templates: getTemplateDefinitions() } });
});
