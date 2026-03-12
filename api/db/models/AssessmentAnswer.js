import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AssessmentAnswer = sequelize.define('AssessmentAnswer', {
    id: { type: DataTypes.UUID, primaryKey: true },
    attemptId: { type: DataTypes.UUID, allowNull: false, field: 'attempt_id' },
    questionId: { type: DataTypes.UUID, allowNull: false, field: 'question_id' },
    answerText: { type: DataTypes.TEXT, allowNull: true, field: 'answer_text' },
    answerJson: { type: DataTypes.JSONB, allowNull: true, field: 'answer_json' },
    score: { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 0 },
    feedback: { type: DataTypes.TEXT, allowNull: true },
    evaluatedByAi: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'evaluated_by_ai' }
  }, {
    tableName: 'assessment_answers',
    underscored: true
  });

  return AssessmentAnswer;
};
