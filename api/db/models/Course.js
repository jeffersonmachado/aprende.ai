import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Course = sequelize.define('Course', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    learningTrackId: { type: DataTypes.UUID, allowNull: false, field: 'learning_track_id' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'sort_order' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' }
  }, {
    tableName: 'courses',
    underscored: true
  });

  return Course;
};
