import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const UserAchievement = sequelize.define('UserAchievement', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    achievementId: { type: DataTypes.UUID, allowNull: false, field: 'achievement_id' },
    unlockedAt: { type: DataTypes.DATE, allowNull: false, field: 'unlocked_at', defaultValue: DataTypes.NOW },
    sourceEventId: { type: DataTypes.UUID, allowNull: true, field: 'source_event_id' }
  }, {
    tableName: 'user_achievements',
    underscored: true
  });

  return UserAchievement;
};
