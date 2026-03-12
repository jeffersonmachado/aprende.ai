import { Router } from 'express';
import { listEvents, publishEvent } from './integration.controller.js';
const router = Router();
router.get('/integration/events', listEvents);
router.post('/integration/events', publishEvent);
export default router;
