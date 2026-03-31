import { Router } from 'express';
import { sendMentorMessage } from './mentor.controller.js';

const router = Router();

router.post('/mentor/message', sendMentorMessage);

export default router;
