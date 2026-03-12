import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AssessmentQuestion = sequelize.define('AssessmentQuestion', {
    id: { type: DataTypes.UUID, primaryKey: true },
    assessmentId: { type: DataTypes.UUID, allowNull: false, field: 'assessment_id' },
    questionType: { type: DataTypes.STRING(40), allowNull: false, field: 'question_type' },
    prompt: { type: DataTypes.TEXT, allowNull: false },
    optionsJson: { type: DataTypes.JSONB, allowNull: true, field: 'options_json' },
    correctAnswerJson: { type: DataTypes.JSONB, allowNull: true, field: 'correct_answer_json' },
    rubricJson: { type: DataTypes.JSONB, allowNull: true, field: 'rubric_json' },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'sort_order' }
  }, {
    tableName: 'assessment_questions',
    underscored: true
  });

  return AssessmentQuestion;
};
