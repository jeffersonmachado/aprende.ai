import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const LessonProgress = sequelize.define('LessonProgress', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    lessonId: { type: DataTypes.UUID, allowNull: true, field: 'lesson_id' },
    enrollmentId: { type: DataTypes.UUID, allowNull: false, field: 'enrollment_id' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
    progressPercent: { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 0, field: 'progress_percent' },
    startedAt: { type: DataTypes.DATE, allowNull: true, field: 'started_at' },
    completedAt: { type: DataTypes.DATE, allowNull: true, field: 'completed_at' },
    lastAccessAt: { type: DataTypes.DATE, allowNull: true, field: 'last_access_at' },
    timeSpentSeconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'time_spent_seconds' }
  }, {
    tableName: 'lesson_progress',
    underscored: true
  });

  return LessonProgress;
};
