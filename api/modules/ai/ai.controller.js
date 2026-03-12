import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as aiService from './ai.service.js';
export const listSessions = asyncHandler(async (req, res) => res.json(await aiService.listSessions(req.tenant.id, req.auth.userId)));
export const startSession = asyncHandler(async (req, res) => res.status(201).json(await aiService.startSession(req.tenant.id, req.auth.userId, req.body)));
export const addMessage = asyncHandler(async (req, res) => res.json(await aiService.addMessage(req.tenant.id, req.params.id, req.body)));
