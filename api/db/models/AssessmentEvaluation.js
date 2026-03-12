import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AssessmentEvaluation = sequelize.define('AssessmentEvaluation', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    attemptId: { type: DataTypes.UUID, allowNull: false, field: 'attempt_id' },
    evaluatorType: { type: DataTypes.STRING(30), allowNull: false, field: 'evaluator_type' },
    modelName: { type: DataTypes.STRING(100), allowNull: true, field: 'model_name' },
    overallScore: { type: DataTypes.DECIMAL(5,2), allowNull: true, field: 'overall_score' },
    summaryFeedback: { type: DataTypes.TEXT, allowNull: true, field: 'summary_feedback' },
    detailedFeedbackJson: { type: DataTypes.JSONB, allowNull: true, field: 'detailed_feedback_json' }
  }, {
    tableName: 'assessment_evaluations',
    underscored: true
  });

  return AssessmentEvaluation;
};
