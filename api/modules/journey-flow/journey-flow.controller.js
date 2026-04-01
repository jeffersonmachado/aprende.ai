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

export const postJourneyStepCompletion = asyncHandler(async (req, res) => {
  const data = await journeyFlowService.completeJourneyStep(req.tenant.id, req.auth.userId, {
    ...req.body,
    stepId: req.params.stepId
  });
  res.json(data);
});

export const postJourneyFlowTelemetry = asyncHandler(async (req, res) => {
  const data = await journeyFlowService.registerJourneyTelemetry(req.tenant.id, req.auth.userId, req.body);
  res.status(201).json(data);
});

export const postJourneyRewardClaim = asyncHandler(async (req, res) => {
  const data = await journeyFlowService.claimJourneyReward(req.tenant.id, req.auth.userId, req.body);
  res.json(data);
});
