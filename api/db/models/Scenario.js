import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Scenario = sequelize.define('Scenario', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    context: { type: DataTypes.TEXT, allowNull: true },
    problem: { type: DataTypes.TEXT, allowNull: true },
    difficulty: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'medium' },
    consequencesJson: { type: DataTypes.JSONB, allowNull: true, field: 'consequences_json' },
    competenciesEvaluatedJson: { type: DataTypes.JSONB, allowNull: true, field: 'competencies_evaluated_json' },
    competencyId: { type: DataTypes.UUID, allowNull: true, field: 'competency_id' },
    learningTrackId: { type: DataTypes.UUID, allowNull: true, field: 'learning_track_id' },
    courseId: { type: DataTypes.UUID, allowNull: true, field: 'course_id' },
    lessonId: { type: DataTypes.UUID, allowNull: true, field: 'lesson_id' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' }
  }, {
    tableName: 'scenarios',
    underscored: true
  });

  return Scenario;
};
