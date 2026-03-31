import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const JourneyState = sequelize.define('JourneyState', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    journeyPlanId: { type: DataTypes.UUID, allowNull: true, field: 'journey_plan_id' },
    currentStepId: { type: DataTypes.UUID, allowNull: true, field: 'current_step_id' },
    progressPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0, field: 'progress_percent' },
    lastEventAt: { type: DataTypes.DATE, allowNull: true, field: 'last_event_at' },
    stateJson: { type: DataTypes.JSONB, allowNull: true, field: 'state_json' }
  }, {
    tableName: 'journey_states',
    underscored: true
  });

  return JourneyState;
};
