import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const KnowledgeChunk = sequelize.define('KnowledgeChunk', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    knowledgeDocumentId: { type: DataTypes.UUID, allowNull: false, field: 'knowledge_document_id' },
    chunkIndex: { type: DataTypes.INTEGER, allowNull: false, field: 'chunk_index' },
    content: { type: DataTypes.TEXT, allowNull: false },
    metadata: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: 'knowledge_chunks',
    underscored: true
  });

  return KnowledgeChunk;
};
