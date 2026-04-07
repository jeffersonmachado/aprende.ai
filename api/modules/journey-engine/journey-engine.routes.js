import { Router } from 'express';
import {
  getCompetencies,
  getProgress,
  getResult,
  getRuntime,
  postDecision,
  postFinalizePhase,
  postReflection,
  postResolveTwist,
  postStartPhase
} from './journey-engine.controller.js';

const router = Router();

router.get('/journey-engine/runtime', getRuntime);
router.post('/journey-engine/phases/:phaseId/start', postStartPhase);
router.post('/journey-engine/decision', postDecision);
router.post('/journey-engine/twist/resolve', postResolveTwist);
router.post('/journey-engine/reflection', postReflection);
router.post('/journey-engine/finalize', postFinalizePhase);
router.get('/journey-engine/result', getResult);
router.get('/journey-engine/progress', getProgress);
router.get('/journey-engine/competencies', getCompetencies);

export default router;