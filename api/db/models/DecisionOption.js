import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const DecisionOption = sequelize.define('DecisionOption', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    scenarioEpisodeId: { type: DataTypes.UUID, allowNull: false, field: 'scenario_episode_id' },
    label: { type: DataTypes.STRING(180), allowNull: false },
    outcomeText: { type: DataTypes.TEXT, allowNull: true, field: 'outcome_text' },
    scoreDelta: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0, field: 'score_delta' },
    metadata: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: 'decision_options',
    underscored: true
  });

  return DecisionOption;
};
