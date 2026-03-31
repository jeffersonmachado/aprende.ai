import { Router } from 'express';
import { getHealth, getOpenAISettings, updateOpenAISettings } from './system.controller.js';

const router = Router();
router.get('/health', getHealth);
router.get('/api/system/openai', getOpenAISettings);
router.post('/api/system/openai', updateOpenAISettings);
export default router;
