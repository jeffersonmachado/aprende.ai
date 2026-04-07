import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const JourneyTwistLog = sequelize.define('JourneyTwistLog', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    journeyStateId: { type: DataTypes.UUID, allowNull: true, field: 'journey_state_id' },
    twistRuleId: { type: DataTypes.UUID, allowNull: true, field: 'twist_rule_id' },
    kind: { type: DataTypes.STRING(60), allowNull: false },
    title: { type: DataTypes.STRING(180), allowNull: false },
    narrative: { type: DataTypes.TEXT, allowNull: false },
    impactJson: { type: DataTypes.JSONB, allowNull: true, field: 'impact_json' },
    suggestedAction: { type: DataTypes.TEXT, allowNull: true, field: 'suggested_action' },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'triggered' },
    triggeredAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'triggered_at' },
    resolvedAt: { type: DataTypes.DATE, allowNull: true, field: 'resolved_at' },
    resolutionNotes: { type: DataTypes.TEXT, allowNull: true, field: 'resolution_notes' },
    metadata: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: 'journey_twist_logs',
    underscored: true
  });

  return JourneyTwistLog;
};
