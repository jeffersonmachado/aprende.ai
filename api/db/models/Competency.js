import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Competency = sequelize.define('Competency', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    code: { type: DataTypes.STRING(60), allowNull: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    category: { type: DataTypes.STRING(60), allowNull: true }
  }, {
    tableName: 'competencies',
    underscored: true
  });

  return Competency;
};
