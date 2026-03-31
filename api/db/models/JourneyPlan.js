import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const JourneyPlan = sequelize.define('JourneyPlan', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    learningGoalId: { type: DataTypes.UUID, allowNull: true, field: 'learning_goal_id' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
    generatedBy: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'ai', field: 'generated_by' },
    metadata: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: 'journey_plans',
    underscored: true
  });

  return JourneyPlan;
};
