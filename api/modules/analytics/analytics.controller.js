import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as analyticsService from './analytics.service.js';

export const getPedagogicalAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getPedagogicalAnalytics(req.tenant.id, req.auth.userId);
  res.json(data);
});
