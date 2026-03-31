import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const DecisionLog = sequelize.define('DecisionLog', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    simulationRunId: { type: DataTypes.UUID, allowNull: false, field: 'simulation_run_id' },
    scenarioEpisodeId: { type: DataTypes.UUID, allowNull: false, field: 'scenario_episode_id' },
    decisionOptionId: { type: DataTypes.UUID, allowNull: false, field: 'decision_option_id' },
    decidedAt: { type: DataTypes.DATE, allowNull: false, field: 'decided_at', defaultValue: DataTypes.NOW },
    feedbackText: { type: DataTypes.TEXT, allowNull: true, field: 'feedback_text' },
    impactJson: { type: DataTypes.JSONB, allowNull: true, field: 'impact_json' },
    feedbackStyle: { type: DataTypes.STRING(30), allowNull: true, field: 'feedback_style' },
    scoreImpact: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0, field: 'score_impact' }
  }, {
    tableName: 'decision_logs',
    underscored: true
  });

  return DecisionLog;
};
