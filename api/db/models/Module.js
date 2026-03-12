import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Module = sequelize.define('Module', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    courseId: { type: DataTypes.UUID, allowNull: false, field: 'course_id' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'sort_order' },
    estimatedMinutes: { type: DataTypes.INTEGER, allowNull: true, field: 'estimated_minutes' }
  }, {
    tableName: 'modules',
    underscored: true
  });

  return Module;
};
