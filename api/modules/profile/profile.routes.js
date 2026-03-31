import { Router } from 'express';
import {
	getProfileOverview,
	saveLearningGoal,
	saveLearningStyle,
	saveOnboarding
} from './profile.controller.js';

const router = Router();

router.get('/profile/me', getProfileOverview);
router.get('/users/me', getProfileOverview);
router.post('/profile/onboarding', saveOnboarding);
router.post('/goals/select', saveLearningGoal);
router.post('/learning-style/select', saveLearningStyle);

export default router;
