import { Router } from 'express';
import { getJourneyFlowState, saveJourneyFlowState } from './journey-flow.controller.js';

const router = Router();

router.get('/journey-flow/state', getJourneyFlowState);
router.post('/journey-flow/state', saveJourneyFlowState);

export default router;
