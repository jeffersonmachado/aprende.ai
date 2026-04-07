import { Router } from 'express';
import { requireRoleCodes } from '../../core/middleware/requireRoleCodes.js';
import {
    getJourneyEffectivenessAnalytics,
	getJourneyFlowState,
	getJourneyRuntime,
	postJourneyCampaignProgress,
	postJourneyPlotTwist,
	postJourneyPlotTwistResolve,
	postJourneyStepCompletion,
	postJourneyFlowTelemetry,
	postJourneyRewardClaim,
	saveJourneyFlowState
} from './journey-flow.controller.js';

const router = Router();
const requireAdmin = requireRoleCodes(['admin']);

router.get('/journey-flow/state', getJourneyFlowState);
router.get('/journey-runtime', getJourneyRuntime);
router.get('/journey-runtime/analytics/effectiveness', requireAdmin, getJourneyEffectivenessAnalytics);
router.post('/journey-flow/state', saveJourneyFlowState);
router.post('/journey-runtime/campaign-progress', postJourneyCampaignProgress);
router.post('/journey-flow/steps/:stepId/complete', postJourneyStepCompletion);
router.post('/journey-flow/telemetry', postJourneyFlowTelemetry);
router.post('/journey-flow/rewards/claim', postJourneyRewardClaim);
router.post('/journey-runtime/plot-twist', postJourneyPlotTwist);
router.post('/journey-runtime/plot-twist/resolve', postJourneyPlotTwistResolve);

export default router;
