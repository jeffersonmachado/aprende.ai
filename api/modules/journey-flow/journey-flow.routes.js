import { Router } from 'express';
import {
	getJourneyFlowState,
	postJourneyStepCompletion,
	postJourneyFlowTelemetry,
	postJourneyRewardClaim,
	saveJourneyFlowState
} from './journey-flow.controller.js';

const router = Router();

router.get('/journey-flow/state', getJourneyFlowState);
router.post('/journey-flow/state', saveJourneyFlowState);
router.post('/journey-flow/steps/:stepId/complete', postJourneyStepCompletion);
router.post('/journey-flow/telemetry', postJourneyFlowTelemetry);
router.post('/journey-flow/rewards/claim', postJourneyRewardClaim);

export default router;
