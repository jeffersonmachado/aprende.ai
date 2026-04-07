import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const JourneyTwistRule = sequelize.define('JourneyTwistRule', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    kind: { type: DataTypes.STRING(60), allowNull: false },
    title: { type: DataTypes.STRING(180), allowNull: false },
    narrative: { type: DataTypes.TEXT, allowNull: false },
    impactJson: { type: DataTypes.JSONB, allowNull: true, field: 'impact_json' },
    suggestedAction: { type: DataTypes.TEXT, allowNull: true, field: 'suggested_action' },
    triggerConditionJson: { type: DataTypes.JSONB, allowNull: true, field: 'trigger_condition_json' },
    rarity: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'common' },
    cooldownMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'cooldown_minutes' },
    priority: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    tableName: 'journey_twist_rules',
    underscored: true
  });

  return JourneyTwistRule;
};
