import { Router } from 'express';
import { createCompetency, listCompetencies, listUserScores } from './competency.controller.js';
const router = Router();
router.get('/competencies', listCompetencies);
router.post('/competencies', createCompetency);
router.get('/competencies/me/scores', listUserScores);
export default router;
