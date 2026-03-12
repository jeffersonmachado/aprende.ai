import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as learningService from './learning.service.js';
export const listTracks = asyncHandler(async (req, res) => res.json(await learningService.listTracks(req.tenant.id)));
export const createTrack = asyncHandler(async (req, res) => res.status(201).json(await learningService.createTrack(req.tenant.id, req.auth.userId, req.body)));
export const getTrackDetails = asyncHandler(async (req, res) => res.json(await learningService.getTrackDetails(req.tenant.id, req.params.id)));
