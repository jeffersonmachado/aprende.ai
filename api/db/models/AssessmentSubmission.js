import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AssessmentSubmission = sequelize.define('AssessmentSubmission', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    assessmentId: { type: DataTypes.UUID, allowNull: true, field: 'assessment_id' },
    assessmentAttemptId: { type: DataTypes.UUID, allowNull: true, field: 'assessment_attempt_id' },
    submissionText: { type: DataTypes.TEXT, allowNull: true, field: 'submission_text' },
    submissionJson: { type: DataTypes.JSONB, allowNull: true, field: 'submission_json' },
    aiScore: { type: DataTypes.DECIMAL(5, 2), allowNull: true, field: 'ai_score' },
    aiFeedback: { type: DataTypes.TEXT, allowNull: true, field: 'ai_feedback' },
    recommendation: { type: DataTypes.TEXT, allowNull: true },
    nextStepSuggestion: { type: DataTypes.TEXT, allowNull: true, field: 'next_step_suggestion' }
  }, {
    tableName: 'assessment_submissions',
    underscored: true
  });

  return AssessmentSubmission;
};
