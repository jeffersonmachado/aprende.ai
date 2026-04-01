import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const GamificationEvent = sequelize.define('GamificationEvent', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    eventType: { type: DataTypes.STRING(80), allowNull: false, field: 'event_type' },
    source: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'platform' },
    referenceType: { type: DataTypes.STRING(60), allowNull: true, field: 'reference_type' },
    referenceId: { type: DataTypes.UUID, allowNull: true, field: 'reference_id' },
    xpAwarded: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'xp_awarded' },
    metadata: { type: DataTypes.JSONB, allowNull: true },
    occurredAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'occurred_at' }
  }, {
    tableName: 'gamification_events',
    underscored: true
  });

  return GamificationEvent;
};
