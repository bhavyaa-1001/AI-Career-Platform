import { getDashboardData } from '../services/dashboardService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const data = await getDashboardData(req.user._id);
  res.status(200).json({ success: true, data });
});
