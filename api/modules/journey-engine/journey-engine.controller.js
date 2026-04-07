import { asyncHandler } from '../../core/http/asyncHandler.js';
import {
  finalizeJourneyEnginePhase,
  getJourneyEngineCompetencies,
  getJourneyEngineProgress,
  getJourneyEngineResult,
  getJourneyEngineRuntime,
  resolveJourneyEngineTwist,
  startJourneyEnginePhase,
  submitJourneyEngineDecision,
  submitJourneyEngineReflection
} from './journey-engine.service.js';

export const getRuntime = asyncHandler(async (req, res) => {
  res.json(await getJourneyEngineRuntime(req.tenant.id, req.auth.userId));
});

export const postStartPhase = asyncHandler(async (req, res) => {
  res.status(201).json(await startJourneyEnginePhase(req.tenant.id, req.auth.userId, {
    ...req.body,
    phaseId: req.params.phaseId
  }));
});

export const postDecision = asyncHandler(async (req, res) => {
  res.status(201).json(await submitJourneyEngineDecision(req.tenant.id, req.auth.userId, req.body));
});

export const postResolveTwist = asyncHandler(async (req, res) => {
  res.json(await resolveJourneyEngineTwist(req.tenant.id, req.auth.userId, req.body));
});

export const postReflection = asyncHandler(async (req, res) => {
  res.status(201).json(await submitJourneyEngineReflection(req.tenant.id, req.auth.userId, req.body));
});

export const postFinalizePhase = asyncHandler(async (req, res) => {
  res.json(await finalizeJourneyEnginePhase(req.tenant.id, req.auth.userId, req.body));
});

export const getResult = asyncHandler(async (req, res) => {
  res.json(await getJourneyEngineResult(req.tenant.id, req.auth.userId));
});

export const getProgress = asyncHandler(async (req, res) => {
  res.json(await getJourneyEngineProgress(req.tenant.id, req.auth.userId));
});

export const getCompetencies = asyncHandler(async (req, res) => {
  res.json(await getJourneyEngineCompetencies(req.tenant.id, req.auth.userId));
});