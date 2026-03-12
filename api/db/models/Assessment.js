import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Assessment = sequelize.define('Assessment', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    lessonId: { type: DataTypes.UUID, allowNull: true, field: 'lesson_id' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    assessmentType: { type: DataTypes.STRING(40), allowNull: false, field: 'assessment_type' },
    instructions: { type: DataTypes.TEXT, allowNull: true },
    settings: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: 'assessments',
    underscored: true
  });

  return Assessment;
};
