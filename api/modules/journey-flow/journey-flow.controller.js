import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as journeyFlowService from './journey-flow.service.js';
import * as journeyRuntimeService from './journey-runtime.service.js';

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

export const getJourneyRuntime = asyncHandler(async (req, res) => {
  const data = await journeyRuntimeService.getJourneyExperienceRuntime(req.tenant.id, req.auth.userId);
  res.json(data);
});

export const postJourneyCampaignProgress = asyncHandler(async (req, res) => {
  const data = await journeyRuntimeService.saveJourneyCampaignProgress(req.tenant.id, req.auth.userId, req.body);
  res.json(data);
});

export const postJourneyPlotTwist = asyncHandler(async (req, res) => {
  const data = await journeyRuntimeService.triggerJourneyPlotTwist(req.tenant.id, req.auth.userId, req.body);
  res.status(201).json(data);
});

export const postJourneyPlotTwistResolve = asyncHandler(async (req, res) => {
  const data = await journeyRuntimeService.resolveJourneyPlotTwist(req.tenant.id, req.auth.userId, req.body);
  res.json(data);
});

export const getJourneyEffectivenessAnalytics = asyncHandler(async (req, res) => {
  const data = await journeyRuntimeService.getJourneyEffectivenessAnalytics(req.tenant.id, {
    days: req.query.days,
    style: req.query.style,
    kind: req.query.kind,
    chapterId: req.query.chapterId,
    phaseId: req.query.phaseId,
    runStatus: req.query.runStatus,
    linkMode: req.query.linkMode
  });
  res.json(data);
});
