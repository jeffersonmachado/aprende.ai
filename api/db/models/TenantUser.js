import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const TenantUser = sequelize.define('TenantUser', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    roleId: { type: DataTypes.UUID, allowNull: false, field: 'role_id' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' }
  }, {
    tableName: 'tenant_users',
    underscored: true
  });

  return TenantUser;
};
