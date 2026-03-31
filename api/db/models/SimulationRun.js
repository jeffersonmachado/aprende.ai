import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const SimulationRun = sequelize.define('SimulationRun', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    scenarioId: { type: DataTypes.UUID, allowNull: false, field: 'scenario_id' },
    journeyPlanId: { type: DataTypes.UUID, allowNull: true, field: 'journey_plan_id' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
    startedAt: { type: DataTypes.DATE, allowNull: false, field: 'started_at', defaultValue: DataTypes.NOW },
    completedAt: { type: DataTypes.DATE, allowNull: true, field: 'completed_at' },
    totalScore: { type: DataTypes.DECIMAL(6, 2), allowNull: false, defaultValue: 0, field: 'total_score' }
  }, {
    tableName: 'simulation_runs',
    underscored: true
  });

  return SimulationRun;
};
