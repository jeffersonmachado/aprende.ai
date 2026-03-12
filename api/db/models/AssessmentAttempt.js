import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AssessmentAttempt = sequelize.define('AssessmentAttempt', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    assessmentId: { type: DataTypes.UUID, allowNull: false, field: 'assessment_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    lessonId: { type: DataTypes.UUID, allowNull: true, field: 'lesson_id' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
    startedAt: { type: DataTypes.DATE, allowNull: true, field: 'started_at' },
    submittedAt: { type: DataTypes.DATE, allowNull: true, field: 'submitted_at' },
    finalScore: { type: DataTypes.DECIMAL(5,2), allowNull: true, field: 'final_score' },
    evaluationStatus: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending', field: 'evaluation_status' }
  }, {
    tableName: 'assessment_attempts',
    underscored: true
  });

  return AssessmentAttempt;
};
