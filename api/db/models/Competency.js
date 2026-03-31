import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Competency = sequelize.define('Competency', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    code: { type: DataTypes.STRING(60), allowNull: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    type: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'hard' },
    description: { type: DataTypes.TEXT, allowNull: true },
    category: { type: DataTypes.STRING(60), allowNull: true },
    dimensionsJson: { type: DataTypes.JSONB, allowNull: true, field: 'dimensions_json' }
  }, {
    tableName: 'competencies',
    underscored: true
  });

  return Competency;
};
