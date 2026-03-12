import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const LearningTrack = sequelize.define('LearningTrack', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    slug: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    coverImageUrl: { type: DataTypes.TEXT, allowNull: true, field: 'cover_image_url' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
    visibility: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'private' },
    estimatedMinutes: { type: DataTypes.INTEGER, allowNull: true, field: 'estimated_minutes' },
    createdBy: { type: DataTypes.UUID, allowNull: true, field: 'created_by' },
    publishedAt: { type: DataTypes.DATE, allowNull: true, field: 'published_at' }
  }, {
    tableName: 'learning_tracks',
    underscored: true
  });

  return LearningTrack;
};
