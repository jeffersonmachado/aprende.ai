import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const JourneyMission = sequelize.define('JourneyMission', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    code: { type: DataTypes.STRING(80), allowNull: true },
    title: { type: DataTypes.STRING(180), allowNull: false },
    context: { type: DataTypes.TEXT, allowNull: true },
    objective: { type: DataTypes.TEXT, allowNull: true },
    riskLevel: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'medio', field: 'risk_level' },
    stakeholdersJson: { type: DataTypes.JSONB, allowNull: true, field: 'stakeholders_json' },
    choicesJson: { type: DataTypes.JSONB, allowNull: true, field: 'choices_json' },
    consequencesJson: { type: DataTypes.JSONB, allowNull: true, field: 'consequences_json' },
    evidenceTargetsJson: { type: DataTypes.JSONB, allowNull: true, field: 'evidence_targets_json' },
    competenciesImpactedJson: { type: DataTypes.JSONB, allowNull: true, field: 'competencies_impacted_json' },
    completionCriteriaJson: { type: DataTypes.JSONB, allowNull: true, field: 'completion_criteria_json' },
    optionalTwistTriggersJson: { type: DataTypes.JSONB, allowNull: true, field: 'optional_twist_triggers_json' },
    trackSlug: { type: DataTypes.STRING(120), allowNull: true, field: 'track_slug' },
    targetArea: { type: DataTypes.STRING(120), allowNull: true, field: 'target_area' },
    audienceStylesJson: { type: DataTypes.JSONB, allowNull: true, field: 'audience_styles_json' },
    sourceType: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'curated', field: 'source_type' },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'sort_order' },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    tableName: 'journey_missions',
    underscored: true
  });

  return JourneyMission;
};
