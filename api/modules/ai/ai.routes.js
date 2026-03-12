import { Router } from 'express';
import { addMessage, listSessions, startSession } from './ai.controller.js';
const router = Router();
router.get('/ai/sessions', listSessions);
router.post('/ai/sessions', startSession);
router.post('/ai/sessions/:id/messages', addMessage);
export default router;
