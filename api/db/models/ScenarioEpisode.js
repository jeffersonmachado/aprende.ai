import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ScenarioEpisode = sequelize.define('ScenarioEpisode', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    scenarioId: { type: DataTypes.UUID, allowNull: false, field: 'scenario_id' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    narrativeText: { type: DataTypes.TEXT, allowNull: false, field: 'narrative_text' },
    episodeIndex: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'episode_index' }
  }, {
    tableName: 'scenario_episodes',
    underscored: true
  });

  return ScenarioEpisode;
};
