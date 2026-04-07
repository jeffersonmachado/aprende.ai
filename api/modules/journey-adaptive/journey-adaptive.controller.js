import { asyncHandler } from '../../core/http/asyncHandler.js';
import {
  completeAdaptiveJourney,
  createAdaptiveJourney,
  getAdaptiveJourneyEvidences,
  getAdaptiveJourneyExplanations,
  getAdaptiveJourneyHistory,
  getAdaptiveJourneyProgress,
  getAdaptiveJourneyRuntime,
  getCurrentAdaptiveJourneyChapter,
  recalculateAdaptiveJourney,
  startAdaptiveJourneyDiagnostic,
  submitAdaptiveJourneyDecision
} from './journey-adaptive.service.js';
import {
  completeJourneySchema,
  createAdaptiveJourneySchema,
  decisionSchema,
  parsePayload,
  recalculateJourneySchema,
  startDiagnosticSchema
} from './journey-adaptive.schemas.js';

export const postStartDiagnostic = asyncHandler(async (req, res) => {
  res.status(201).json(await startAdaptiveJourneyDiagnostic(
    req.tenant.id,
    req.auth.userId,
    parsePayload(startDiagnosticSchema, req.body, 'Payload inválido para iniciar diagnóstico adaptativo.')
  ));
});

export const postCreateJourney = asyncHandler(async (req, res) => {
  res.status(201).json(await createAdaptiveJourney(
    req.tenant.id,
    req.auth.userId,
    parsePayload(createAdaptiveJourneySchema, req.body, 'Payload inválido para criar jornada adaptativa.')
  ));
});

export const getRuntime = asyncHandler(async (req, res) => {
  res.json(await getAdaptiveJourneyRuntime(req.tenant.id, req.auth.userId));
});

export const getCurrentChapter = asyncHandler(async (req, res) => {
  res.json(await getCurrentAdaptiveJourneyChapter(req.tenant.id, req.auth.userId));
});

export const postDecision = asyncHandler(async (req, res) => {
  res.status(201).json(await submitAdaptiveJourneyDecision(
    req.tenant.id,
    req.auth.userId,
    parsePayload(decisionSchema, req.body, 'Payload inválido para registrar decisão adaptativa.')
  ));
});

export const postRecalculate = asyncHandler(async (req, res) => {
  res.json(await recalculateAdaptiveJourney(
    req.tenant.id,
    req.auth.userId,
    parsePayload(recalculateJourneySchema, req.body, 'Payload inválido para recalcular jornada adaptativa.')
  ));
});

export const getProgress = asyncHandler(async (req, res) => {
  res.json(await getAdaptiveJourneyProgress(req.tenant.id, req.auth.userId));
});

export const getEvidences = asyncHandler(async (req, res) => {
  res.json(await getAdaptiveJourneyEvidences(req.tenant.id, req.auth.userId));
});

export const getHistory = asyncHandler(async (req, res) => {
  res.json(await getAdaptiveJourneyHistory(req.tenant.id, req.auth.userId));
});

export const getExplanations = asyncHandler(async (req, res) => {
  res.json(await getAdaptiveJourneyExplanations(req.tenant.id, req.auth.userId));
});

export const postComplete = asyncHandler(async (req, res) => {
  res.json(await completeAdaptiveJourney(
    req.tenant.id,
    req.auth.userId,
    parsePayload(completeJourneySchema, req.body, 'Payload inválido para encerrar jornada adaptativa.')
  ));
});
