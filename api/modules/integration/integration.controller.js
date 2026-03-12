import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as integrationService from './integration.service.js';
export const listEvents = asyncHandler(async (req, res) => res.json(await integrationService.listEvents(req.tenant.id)));
export const publishEvent = asyncHandler(async (req, res) => res.status(201).json(await integrationService.publishEvent(req.tenant.id, req.body)));
