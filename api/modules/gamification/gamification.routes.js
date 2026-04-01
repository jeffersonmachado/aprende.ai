import { Router } from 'express';
import { requireRoleCodes } from '../../core/middleware/requireRoleCodes.js';
import {
  getLeaderboard,
  getLevelRules,
  getMyGamificationSummary,
  getRewardRules,
  getRecentEvents,
  putLevelRule,
  putRewardRule,
  postCheckIn
} from './gamification.controller.js';

const router = Router();
const requireGamificationAdmin = requireRoleCodes(['admin']);

router.get('/gamification/me', getMyGamificationSummary);
router.get('/gamification/events', getRecentEvents);
router.get('/gamification/leaderboard', getLeaderboard);
router.get('/gamification/admin/reward-rules', requireGamificationAdmin, getRewardRules);
router.put('/gamification/admin/reward-rules', requireGamificationAdmin, putRewardRule);
router.get('/gamification/admin/level-rules', requireGamificationAdmin, getLevelRules);
router.put('/gamification/admin/level-rules', requireGamificationAdmin, putLevelRule);
router.post('/gamification/check-in', postCheckIn);

export default router;
