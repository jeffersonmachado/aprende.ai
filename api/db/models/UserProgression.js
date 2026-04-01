import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const UserProgression = sequelize.define('UserProgression', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    xpTotal: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'xp_total' },
    currentLevel: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'current_level' },
    xpInCurrentLevel: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'xp_in_current_level' },
    xpToNextLevel: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 120, field: 'xp_to_next_level' },
    lastEventAt: { type: DataTypes.DATE, allowNull: true, field: 'last_event_at' }
  }, {
    tableName: 'user_progression',
    underscored: true
  });

  return UserProgression;
};
