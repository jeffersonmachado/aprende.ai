import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const JourneyPlanStep = sequelize.define('JourneyPlanStep', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    journeyPlanId: { type: DataTypes.UUID, allowNull: false, field: 'journey_plan_id' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    stepType: { type: DataTypes.STRING(30), allowNull: false, field: 'step_type' },
    orderIndex: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'order_index' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
    competencyId: { type: DataTypes.UUID, allowNull: true, field: 'competency_id' },
    lessonId: { type: DataTypes.UUID, allowNull: true, field: 'lesson_id' },
    scenarioId: { type: DataTypes.UUID, allowNull: true, field: 'scenario_id' }
  }, {
    tableName: 'journey_plan_steps',
    underscored: true
  });

  return JourneyPlanStep;
};
