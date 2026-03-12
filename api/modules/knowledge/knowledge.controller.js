import { asyncHandler } from '../../core/http/asyncHandler.js';
import * as knowledgeService from './knowledge.service.js';
export const listSources = asyncHandler(async (req, res) => res.json(await knowledgeService.listSources(req.tenant.id)));
export const createSource = asyncHandler(async (req, res) => res.status(201).json(await knowledgeService.createSource(req.tenant.id, req.body)));
export const listDocuments = asyncHandler(async (req, res) => res.json(await knowledgeService.listDocuments(req.tenant.id)));
export const createDocument = asyncHandler(async (req, res) => res.status(201).json(await knowledgeService.createDocument(req.tenant.id, req.body)));
