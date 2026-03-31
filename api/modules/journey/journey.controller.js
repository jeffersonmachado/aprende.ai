import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as journeyService from './journey.service.js';

export const getJourneySummary = asyncHandler(async (req, res) => {
  const data = await journeyService.getJourneySummary(req.tenant.id, req.auth.userId);
  res.json(data);
});
