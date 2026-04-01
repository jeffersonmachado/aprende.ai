import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const UserStreak = sequelize.define('UserStreak', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    currentStreak: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'current_streak' },
    bestStreak: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'best_streak' },
    lastActiveDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'last_active_date' },
    lastEventAt: { type: DataTypes.DATE, allowNull: true, field: 'last_event_at' }
  }, {
    tableName: 'user_streaks',
    underscored: true
  });

  return UserStreak;
};
