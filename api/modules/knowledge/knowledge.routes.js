import { Router } from 'express';
import { createDocument, createSource, listDocuments, listSources } from './knowledge.controller.js';
const router = Router();
router.get('/knowledge/sources', listSources);
router.post('/knowledge/sources', createSource);
router.get('/knowledge/documents', listDocuments);
router.post('/knowledge/documents', createDocument);
export default router;
