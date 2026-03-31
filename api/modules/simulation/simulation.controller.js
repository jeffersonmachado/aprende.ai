import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as simulationService from './simulation.service.js';

export const getSimulationCatalog = asyncHandler(async (req, res) => {
  const data = await simulationService.getSimulationCatalog(req.tenant.id, req.auth.userId);
  res.json(data);
});

export const listScenarios = asyncHandler(async (req, res) => {
  const data = await simulationService.listScenarios(req.tenant.id, req.auth.userId);
  res.json(data);
});

export const createScenario = asyncHandler(async (req, res) => {
  const data = await simulationService.createScenario(req.tenant.id, req.body);
  res.status(201).json(data);
});

export const startSimulation = asyncHandler(async (req, res) => {
  const data = await simulationService.startSimulation(req.tenant.id, req.auth.userId, req.body);
  res.status(201).json(data);
});

export const getSimulationState = asyncHandler(async (req, res) => {
  const data = await simulationService.getSimulationState(req.tenant.id, req.auth.userId, req.params.id);
  res.json(data);
});

export const submitDecision = asyncHandler(async (req, res) => {
  const data = await simulationService.submitDecision(req.tenant.id, req.auth.userId, req.params.id, req.body);
  res.json(data);
});

export const submitDecisionByRun = asyncHandler(async (req, res) => {
  const data = await simulationService.submitDecisionByRun(req.tenant.id, req.auth.userId, req.body);
  res.json(data);
});

export const getDecisionHistory = asyncHandler(async (req, res) => {
  const data = await simulationService.getDecisionHistory(req.tenant.id, req.auth.userId);
  res.json(data);
});

export const getEvolution = asyncHandler(async (req, res) => {
  const data = await simulationService.getUserEvolution(req.tenant.id, req.auth.userId);
  res.json(data);
});
