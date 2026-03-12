import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const LessonContent = sequelize.define('LessonContent', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    lessonId: { type: DataTypes.UUID, allowNull: true, field: 'lesson_id' },
    contentType: { type: DataTypes.STRING(40), allowNull: false, field: 'content_type' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: true },
    contentJson: { type: DataTypes.JSONB, allowNull: true, field: 'content_json' },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'sort_order' }
  }, {
    tableName: 'lesson_contents',
    underscored: true
  });

  return LessonContent;
};
