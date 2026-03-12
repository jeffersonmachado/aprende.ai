import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    email: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.TEXT, allowNull: false, field: 'password_hash' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
    lastLoginAt: { type: DataTypes.DATE, allowNull: true, field: 'last_login_at' },
    profileMetadata: { type: DataTypes.JSONB, allowNull: true, field: 'profile_metadata' }
  }, {
    tableName: 'users',
    underscored: true
  });

  return User;
};
