import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Tenant = sequelize.define('Tenant', {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
    plan: { type: DataTypes.STRING(50), allowNull: true },
    settings: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: 'tenants',
    underscored: true
  });

  return Tenant;
};
