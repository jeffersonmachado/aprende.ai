import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Achievement = sequelize.define('Achievement', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    code: { type: DataTypes.STRING(80), allowNull: false },
    title: { type: DataTypes.STRING(140), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    category: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'progression' },
    icon: { type: DataTypes.STRING(40), allowNull: true },
    criteriaJson: { type: DataTypes.JSONB, allowNull: false, defaultValue: {}, field: 'criteria_json' },
    xpReward: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'xp_reward' },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    tableName: 'achievements',
    underscored: true
  });

  return Achievement;
};
