import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Role = sequelize.define('Role', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    code: { type: DataTypes.STRING(50), allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    isSystem: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_system' }
  }, {
    tableName: 'roles',
    underscored: true
  });

  return Role;
};
