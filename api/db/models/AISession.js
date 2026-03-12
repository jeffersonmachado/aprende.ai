import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AISession = sequelize.define('AISession', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    lessonId: { type: DataTypes.UUID, allowNull: true, field: 'lesson_id' },
    assessmentAttemptId: { type: DataTypes.UUID, allowNull: true, field: 'assessment_attempt_id' },
    sessionType: { type: DataTypes.STRING(40), allowNull: false, field: 'session_type' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
    startedAt: { type: DataTypes.DATE, allowNull: true, field: 'started_at' },
    endedAt: { type: DataTypes.DATE, allowNull: true, field: 'ended_at' },
    metadata: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: 'ai_sessions',
    underscored: true
  });

  return AISession;
};
