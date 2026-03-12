import { v4 as uuidv4 } from 'uuid';
import { KnowledgeDocument, KnowledgeSource } from '../../db/models/index.js';
import { AppError } from '../../core/errors/AppError.js';
export async function listSources(tenantId) { return KnowledgeSource.findAll({ where: { tenantId }, order: [['createdAt', 'DESC']] }); }
export async function createSource(tenantId, payload) { return KnowledgeSource.create({ id: uuidv4(), tenantId, name: payload.name, sourceType: payload.sourceType, status: payload.status || 'active', metadata: payload.metadata || {} }); }
export async function listDocuments(tenantId) { return KnowledgeDocument.findAll({ where: { tenantId }, order: [['createdAt', 'DESC']] }); }
export async function createDocument(tenantId, payload) {
  const source = await KnowledgeSource.findOne({ where: { id: payload.knowledgeSourceId, tenantId } });
  if (!source) throw new AppError('Fonte de conhecimento não encontrada', 404);
  return KnowledgeDocument.create({ id: uuidv4(), tenantId, knowledgeSourceId: payload.knowledgeSourceId, title: payload.title, fileName: payload.fileName || null, mimeType: payload.mimeType || null, storageUrl: payload.storageUrl || null, documentText: payload.documentText || null, status: payload.status || 'pending', metadata: payload.metadata || {} });
}
