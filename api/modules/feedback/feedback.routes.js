import { Router } from 'express';
import { generateFeedback } from './feedback.controller.js';

const router = Router();

router.post('/feedback/generate', generateFeedback);

export default router;
