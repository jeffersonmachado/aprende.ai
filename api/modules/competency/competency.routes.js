import { Router } from 'express';
import { createCompetency, getCompetencyMatrix, listCompetencies, listUserScores } from './competency.controller.js';
const router = Router();
router.get('/competencies', listCompetencies);
router.post('/competencies', createCompetency);
router.get('/competencies/me/scores', listUserScores);
router.get('/competencies/me/matrix', getCompetencyMatrix);
export default router;
