import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const LevelRule = sequelize.define('LevelRule', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    level: { type: DataTypes.INTEGER, allowNull: false },
    xpRequired: { type: DataTypes.INTEGER, allowNull: false, field: 'xp_required' },
    title: { type: DataTypes.STRING(80), allowNull: false },
    perksJson: { type: DataTypes.JSONB, allowNull: true, field: 'perks_json' },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    tableName: 'level_rules',
    underscored: true
  });

  return LevelRule;
};
