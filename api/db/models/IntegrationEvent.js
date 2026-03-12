import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const IntegrationEvent = sequelize.define('IntegrationEvent', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    sourceSystem: { type: DataTypes.STRING(80), allowNull: false, field: 'source_system' },
    eventType: { type: DataTypes.STRING(120), allowNull: false, field: 'event_type' },
    direction: { type: DataTypes.STRING(20), allowNull: false },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
    payload: { type: DataTypes.JSONB, allowNull: false },
    processedAt: { type: DataTypes.DATE, allowNull: true, field: 'processed_at' },
    errorMessage: { type: DataTypes.TEXT, allowNull: true, field: 'error_message' }
  }, {
    tableName: 'integration_events',
    underscored: true
  });

  return IntegrationEvent;
};
