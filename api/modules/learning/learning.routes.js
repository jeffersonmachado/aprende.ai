import { Router } from 'express';
import { createTrack, getTrackDetails, listTracks } from './learning.controller.js';
const router = Router();
router.get('/tracks', listTracks);
router.post('/tracks', createTrack);
router.get('/tracks/:id', getTrackDetails);
export default router;
