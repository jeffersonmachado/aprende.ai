import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const JourneyReward = sequelize.define('JourneyReward', {
    id: { type: DataTypes.STRING(120), primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    journeyStateId: { type: DataTypes.UUID, allowNull: true, field: 'journey_state_id' },
    type: { type: DataTypes.STRING(20), allowNull: false },
    title: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    rarity: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'common' },
    source: { type: DataTypes.STRING(20), allowNull: false },
    stepId: { type: DataTypes.STRING(40), allowNull: true, field: 'step_id' },
    effect: { type: DataTypes.JSONB, allowNull: true },
    unlockedAt: { type: DataTypes.DATE, allowNull: true, field: 'unlocked_at' },
    claimedAt: { type: DataTypes.DATE, allowNull: true, field: 'claimed_at' },
    claimed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    tableName: 'journey_rewards',
    underscored: true
  });

  return JourneyReward;
};
