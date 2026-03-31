import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const LearningGoal = sequelize.define('LearningGoal', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    goalType: { type: DataTypes.STRING(60), allowNull: true, field: 'goal_type' },
    description: { type: DataTypes.TEXT, allowNull: true },
    targetDate: { type: DataTypes.DATE, allowNull: true, field: 'target_date' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' }
  }, {
    tableName: 'learning_goals',
    underscored: true
  });

  return LearningGoal;
};
