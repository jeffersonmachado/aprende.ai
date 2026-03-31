import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const LearningStyleProfile = sequelize.define('LearningStyleProfile', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    dominantStyle: { type: DataTypes.STRING(60), allowNull: false, field: 'dominant_style' },
    contentPreference: { type: DataTypes.STRING(60), allowNull: true, field: 'content_preference' },
    mentorshipStyle: { type: DataTypes.STRING(30), allowNull: true, field: 'mentorship_style' },
    simulationFormat: { type: DataTypes.STRING(60), allowNull: true, field: 'simulation_format' },
    styleScoresJson: { type: DataTypes.JSONB, allowNull: true, field: 'style_scores_json' },
    recommendationsJson: { type: DataTypes.JSONB, allowNull: true, field: 'recommendations_json' }
  }, {
    tableName: 'learning_style_profiles',
    underscored: true
  });

  return LearningStyleProfile;
};
