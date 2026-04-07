import { Router } from 'express';
import {
  getCurrentChapter,
  getEvidences,
  getExplanations,
  getHistory,
  getProgress,
  getRuntime,
  postComplete,
  postCreateJourney,
  postDecision,
  postRecalculate,
  postStartDiagnostic
} from './journey-adaptive.controller.js';

const router = Router();

router.post('/journey-adaptive/diagnostic/start', postStartDiagnostic);
router.post('/journey-adaptive/session', postCreateJourney);
router.get('/journey-adaptive/runtime', getRuntime);
router.get('/journey-adaptive/current-chapter', getCurrentChapter);
router.post('/journey-adaptive/decision', postDecision);
router.post('/journey-adaptive/recalculate', postRecalculate);
router.get('/journey-adaptive/progress', getProgress);
router.get('/journey-adaptive/evidences', getEvidences);
router.get('/journey-adaptive/history', getHistory);
router.get('/journey-adaptive/explanations', getExplanations);
router.post('/journey-adaptive/complete', postComplete);

export default router;
