import { Router } from 'express';
import {
  createScenario,
  getDecisionHistory,
  getEvolution,
  getSimulationCatalog,
  getSimulationState,
  listScenarios,
  submitDecisionByRun,
  startSimulation,
  submitDecision
} from './simulation.controller.js';

const router = Router();

router.get('/simulation/catalog', getSimulationCatalog);
router.post('/simulation/start', startSimulation);
router.get('/simulation/:id', getSimulationState);
router.post('/simulation/:id/decision', submitDecision);
router.get('/scenarios', listScenarios);
router.post('/scenarios', createScenario);
router.post('/decisions', submitDecisionByRun);
router.get('/decisions/history', getDecisionHistory);
router.get('/evolution/me', getEvolution);

export default router;
