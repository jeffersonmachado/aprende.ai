import { Router } from 'express';
import { getPedagogicalAnalytics } from './analytics.controller.js';

const router = Router();

router.get('/analytics/pedagogical', getPedagogicalAnalytics);

export default router;
