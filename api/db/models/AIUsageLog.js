import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AIUsageLog = sequelize.define('AIUsageLog', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    aiSessionId: { type: DataTypes.UUID, allowNull: false, field: 'ai_session_id' },
    provider: { type: DataTypes.STRING(50), allowNull: true },
    modelName: { type: DataTypes.STRING(100), allowNull: true, field: 'model_name' },
    feature: { type: DataTypes.STRING(50), allowNull: true },
    inputTokens: { type: DataTypes.INTEGER, allowNull: true, field: 'input_tokens' },
    outputTokens: { type: DataTypes.INTEGER, allowNull: true, field: 'output_tokens' },
    estimatedCost: { type: DataTypes.DECIMAL(12,6), allowNull: true, field: 'estimated_cost' },
    latencyMs: { type: DataTypes.INTEGER, allowNull: true, field: 'latency_ms' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' }
  }, {
    tableName: 'ai_usage_logs',
    underscored: true
  });

  return AIUsageLog;
};
