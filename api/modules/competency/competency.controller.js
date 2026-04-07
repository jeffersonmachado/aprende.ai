import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as competencyService from './competency.service.js';
export const listCompetencies = asyncHandler(async (req, res) => res.json(await competencyService.listCompetencies(req.tenant.id)));
export const createCompetency = asyncHandler(async (req, res) => res.status(201).json(await competencyService.createCompetency(req.tenant.id, req.body)));
export const listUserScores = asyncHandler(async (req, res) => res.json(await competencyService.listUserScores(req.tenant.id, req.auth.userId)));
export const getCompetencyMatrix = asyncHandler(async (req, res) => res.json(await competencyService.getCompetencyMatrix(req.tenant.id, req.auth.userId)));
