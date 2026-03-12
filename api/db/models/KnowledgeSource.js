import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const KnowledgeSource = sequelize.define('KnowledgeSource', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    name: { type: DataTypes.STRING(180), allowNull: false },
    sourceType: { type: DataTypes.STRING(50), allowNull: false, field: 'source_type' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
    metadata: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: 'knowledge_sources',
    underscored: true
  });

  return KnowledgeSource;
};
