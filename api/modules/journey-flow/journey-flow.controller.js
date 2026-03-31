import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as journeyFlowService from './journey-flow.service.js';

export const getJourneyFlowState = asyncHandler(async (req, res) => {
  const data = await journeyFlowService.getJourneyFlowState(req.tenant.id, req.auth.userId);
  res.json(data);
});

export const saveJourneyFlowState = asyncHandler(async (req, res) => {
  const data = await journeyFlowService.saveJourneyFlowState(req.tenant.id, req.auth.userId, req.body);
  res.json(data);
});
