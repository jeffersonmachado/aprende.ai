import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Enrollment = sequelize.define('Enrollment', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    learningTrackId: { type: DataTypes.UUID, allowNull: false, field: 'learning_track_id' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
    startedAt: { type: DataTypes.DATE, allowNull: true, field: 'started_at' },
    completedAt: { type: DataTypes.DATE, allowNull: true, field: 'completed_at' },
    progressPercent: { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 0, field: 'progress_percent' }
  }, {
    tableName: 'enrollments',
    underscored: true
  });

  return Enrollment;
};
