import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const JourneyEvent = sequelize.define('JourneyEvent', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    journeyId: { type: DataTypes.UUID, allowNull: true, field: 'journey_id' },
    eventType: { type: DataTypes.STRING(40), allowNull: false, field: 'event_type' },
    stepId: { type: DataTypes.STRING(40), allowNull: true, field: 'step_id' },
    xpGained: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'xp_gained' },
    level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    streak: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    metadata: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: 'journey_events',
    underscored: true
  });

  return JourneyEvent;
};
