import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as assessmentService from './assessment.service.js';
export const listAssessments = asyncHandler(async (req, res) => res.json(await assessmentService.listAssessments(req.tenant.id)));
export const getAssessment = asyncHandler(async (req, res) => res.json(await assessmentService.getAssessment(req.tenant.id, req.params.id)));
export const startAttempt = asyncHandler(async (req, res) => res.status(201).json(await assessmentService.startAttempt(req.tenant.id, req.auth.userId, req.params.id)));
export const submitAttempt = asyncHandler(async (req, res) => res.json(await assessmentService.submitAttempt(req.tenant.id, req.params.id, req.body.answers)));
export const evaluateAssessment = asyncHandler(async (req, res) => res.json(await assessmentService.evaluateAssessment(req.tenant.id, req.auth.userId, req.body)));
