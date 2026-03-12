import { Router } from 'express';
import { getHealth } from './system.controller.js';

const router = Router();
router.get('/health', getHealth);
export default router;
