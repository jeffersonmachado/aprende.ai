import { Router } from 'express';
import { getJourneySummary } from './journey.controller.js';

const router = Router();

router.get('/journey/me', getJourneySummary);

export default router;
