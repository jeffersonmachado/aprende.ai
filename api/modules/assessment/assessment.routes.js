import { Router } from 'express';
import { evaluateAssessment, getAssessment, listAssessments, startAttempt, submitAttempt } from './assessment.controller.js';
const router = Router();
router.get('/assessments', listAssessments);
router.get('/assessments/:id', getAssessment);
router.post('/assessments/:id/attempts', startAttempt);
router.post('/attempts/:id/submit', submitAttempt);
router.post('/assessment/evaluate', evaluateAssessment);
export default router;
