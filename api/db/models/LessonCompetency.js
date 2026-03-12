import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const LessonCompetency = sequelize.define('LessonCompetency', {
    id: { type: DataTypes.UUID, primaryKey: true },
    lessonId: { type: DataTypes.UUID, allowNull: true, field: 'lesson_id' },
    competencyId: { type: DataTypes.UUID, allowNull: false, field: 'competency_id' },
    weight: { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 1 }
  }, {
    tableName: 'lesson_competencies',
    underscored: true
  });

  return LessonCompetency;
};
