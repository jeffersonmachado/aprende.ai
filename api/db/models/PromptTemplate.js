import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const PromptTemplate = sequelize.define('PromptTemplate', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    code: { type: DataTypes.STRING(100), allowNull: false },
    name: { type: DataTypes.STRING(150), allowNull: false },
    promptText: { type: DataTypes.TEXT, allowNull: false, field: 'prompt_text' },
    version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
    metadata: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: 'prompt_templates',
    underscored: true
  });

  return PromptTemplate;
};
