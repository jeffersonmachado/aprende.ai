import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const KnowledgeDocument = sequelize.define('KnowledgeDocument', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    knowledgeSourceId: { type: DataTypes.UUID, allowNull: false, field: 'knowledge_source_id' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    fileName: { type: DataTypes.STRING(255), allowNull: true, field: 'file_name' },
    mimeType: { type: DataTypes.STRING(120), allowNull: true, field: 'mime_type' },
    storageUrl: { type: DataTypes.TEXT, allowNull: true, field: 'storage_url' },
    documentText: { type: DataTypes.TEXT, allowNull: true, field: 'document_text' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
    indexedAt: { type: DataTypes.DATE, allowNull: true, field: 'indexed_at' },
    metadata: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: 'knowledge_documents',
    underscored: true
  });

  return KnowledgeDocument;
};
