import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const RewardRule = sequelize.define('RewardRule', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    eventType: { type: DataTypes.STRING(80), allowNull: false, field: 'event_type' },
    xpAmount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'xp_amount' },
    metadata: { type: DataTypes.JSONB, allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    tableName: 'reward_rules',
    underscored: true
  });

  return RewardRule;
};
