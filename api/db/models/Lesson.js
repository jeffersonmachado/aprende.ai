import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Lesson = sequelize.define('Lesson', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    moduleId: { type: DataTypes.UUID, allowNull: false, field: 'module_id' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    lessonType: { type: DataTypes.STRING(40), allowNull: false, field: 'lesson_type' },
    description: { type: DataTypes.TEXT, allowNull: true },
    contentStatus: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'draft', field: 'content_status' },
    estimatedMinutes: { type: DataTypes.INTEGER, allowNull: true, field: 'estimated_minutes' },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'sort_order' },
    createdBy: { type: DataTypes.UUID, allowNull: true, field: 'created_by' },
    publishedAt: { type: DataTypes.DATE, allowNull: true, field: 'published_at' }
  }, {
    tableName: 'lessons',
    underscored: true
  });

  return Lesson;
};
