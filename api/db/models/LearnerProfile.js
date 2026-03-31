import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const LearnerProfile = sequelize.define('LearnerProfile', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    displayName: { type: DataTypes.STRING(120), allowNull: true, field: 'display_name' },
    currentLevel: { type: DataTypes.STRING(40), allowNull: true, field: 'current_level' },
    contextType: { type: DataTypes.STRING(20), allowNull: true, field: 'context_type' },
    area: { type: DataTypes.STRING(120), allowNull: true },
    experienceLevel: { type: DataTypes.STRING(40), allowNull: true, field: 'experience_level' },
    primaryObjective: { type: DataTypes.STRING(200), allowNull: true, field: 'primary_objective' },
    bio: { type: DataTypes.TEXT, allowNull: true },
    preferencesJson: { type: DataTypes.JSONB, allowNull: true, field: 'preferences_json' }
  }, {
    tableName: 'learner_profiles',
    underscored: true
  });

  return LearnerProfile;
};
