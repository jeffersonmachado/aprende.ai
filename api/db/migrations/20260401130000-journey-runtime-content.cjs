'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('journey_missions', {
      id: { type: DataTypes.UUID, primaryKey: true },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE'
      },
      code: { type: DataTypes.STRING(80), allowNull: true },
      title: { type: DataTypes.STRING(180), allowNull: false },
      context: { type: DataTypes.TEXT, allowNull: true },
      objective: { type: DataTypes.TEXT, allowNull: true },
      risk_level: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'medio' },
      stakeholders_json: { type: DataTypes.JSONB, allowNull: true },
      choices_json: { type: DataTypes.JSONB, allowNull: true },
      consequences_json: { type: DataTypes.JSONB, allowNull: true },
      evidence_targets_json: { type: DataTypes.JSONB, allowNull: true },
      competencies_impacted_json: { type: DataTypes.JSONB, allowNull: true },
      completion_criteria_json: { type: DataTypes.JSONB, allowNull: true },
      optional_twist_triggers_json: { type: DataTypes.JSONB, allowNull: true },
      source_type: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'curated' },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('journey_twist_rules', {
      id: { type: DataTypes.UUID, primaryKey: true },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE'
      },
      kind: { type: DataTypes.STRING(60), allowNull: false },
      title: { type: DataTypes.STRING(180), allowNull: false },
      narrative: { type: DataTypes.TEXT, allowNull: false },
      impact_json: { type: DataTypes.JSONB, allowNull: true },
      suggested_action: { type: DataTypes.TEXT, allowNull: true },
      trigger_condition_json: { type: DataTypes.JSONB, allowNull: true },
      rarity: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'common' },
      cooldown_minutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      priority: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('journey_twist_logs', {
      id: { type: DataTypes.UUID, primaryKey: true },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      journey_state_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'journey_states', key: 'id' },
        onDelete: 'SET NULL'
      },
      twist_rule_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'journey_twist_rules', key: 'id' },
        onDelete: 'SET NULL'
      },
      kind: { type: DataTypes.STRING(60), allowNull: false },
      title: { type: DataTypes.STRING(180), allowNull: false },
      narrative: { type: DataTypes.TEXT, allowNull: false },
      impact_json: { type: DataTypes.JSONB, allowNull: true },
      suggested_action: { type: DataTypes.TEXT, allowNull: true },
      status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'triggered' },
      triggered_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      resolved_at: { type: DataTypes.DATE, allowNull: true },
      resolution_notes: { type: DataTypes.TEXT, allowNull: true },
      metadata: { type: DataTypes.JSONB, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.addIndex('journey_missions', ['tenant_id', 'active', 'sort_order']);
    await queryInterface.addIndex('journey_missions', ['tenant_id', 'code'], { unique: true });

    await queryInterface.addIndex('journey_twist_rules', ['tenant_id', 'active', 'priority']);
    await queryInterface.addIndex('journey_twist_rules', ['tenant_id', 'kind']);

    await queryInterface.addIndex('journey_twist_logs', ['tenant_id', 'user_id', 'status']);
    await queryInterface.addIndex('journey_twist_logs', ['tenant_id', 'triggered_at']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('journey_twist_logs', ['tenant_id', 'triggered_at']);
    await queryInterface.removeIndex('journey_twist_logs', ['tenant_id', 'user_id', 'status']);

    await queryInterface.removeIndex('journey_twist_rules', ['tenant_id', 'kind']);
    await queryInterface.removeIndex('journey_twist_rules', ['tenant_id', 'active', 'priority']);

    await queryInterface.removeIndex('journey_missions', ['tenant_id', 'code']);
    await queryInterface.removeIndex('journey_missions', ['tenant_id', 'active', 'sort_order']);

    await queryInterface.dropTable('journey_twist_logs');
    await queryInterface.dropTable('journey_twist_rules');
    await queryInterface.dropTable('journey_missions');
  }
};
