'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('user_progression', {
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
      xp_total: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      current_level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      xp_in_current_level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      xp_to_next_level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 120 },
      last_event_at: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('user_streaks', {
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
      current_streak: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      best_streak: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      last_active_date: { type: DataTypes.DATEONLY, allowNull: true },
      last_event_at: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('reward_rules', {
      id: { type: DataTypes.UUID, primaryKey: true },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE'
      },
      event_type: { type: DataTypes.STRING(80), allowNull: false },
      xp_amount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      metadata: { type: DataTypes.JSONB, allowNull: true },
      active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('level_rules', {
      id: { type: DataTypes.UUID, primaryKey: true },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE'
      },
      level: { type: DataTypes.INTEGER, allowNull: false },
      xp_required: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING(80), allowNull: false },
      perks_json: { type: DataTypes.JSONB, allowNull: true },
      active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('achievements', {
      id: { type: DataTypes.UUID, primaryKey: true },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE'
      },
      code: { type: DataTypes.STRING(80), allowNull: false },
      title: { type: DataTypes.STRING(140), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      category: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'progression' },
      icon: { type: DataTypes.STRING(40), allowNull: true },
      criteria_json: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      xp_reward: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('gamification_events', {
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
      event_type: { type: DataTypes.STRING(80), allowNull: false },
      source: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'platform' },
      reference_type: { type: DataTypes.STRING(60), allowNull: true },
      reference_id: { type: DataTypes.UUID, allowNull: true },
      xp_awarded: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      metadata: { type: DataTypes.JSONB, allowNull: true },
      occurred_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('user_achievements', {
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
      achievement_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'achievements', key: 'id' },
        onDelete: 'CASCADE'
      },
      unlocked_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      source_event_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'gamification_events', key: 'id' },
        onDelete: 'SET NULL'
      },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.addIndex('user_progression', ['tenant_id', 'user_id'], { unique: true });
    await queryInterface.addIndex('user_streaks', ['tenant_id', 'user_id'], { unique: true });
    await queryInterface.addIndex('reward_rules', ['tenant_id', 'event_type']);
    await queryInterface.addIndex('level_rules', ['tenant_id', 'level'], { unique: true });
    await queryInterface.addIndex('achievements', ['tenant_id', 'code'], { unique: true });
    await queryInterface.addIndex('gamification_events', ['tenant_id', 'user_id', 'occurred_at']);
    await queryInterface.addIndex('gamification_events', ['tenant_id', 'user_id', 'event_type']);
    await queryInterface.addIndex('user_achievements', ['tenant_id', 'user_id', 'achievement_id'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('user_achievements', ['tenant_id', 'user_id', 'achievement_id']);
    await queryInterface.removeIndex('gamification_events', ['tenant_id', 'user_id', 'event_type']);
    await queryInterface.removeIndex('gamification_events', ['tenant_id', 'user_id', 'occurred_at']);
    await queryInterface.removeIndex('achievements', ['tenant_id', 'code']);
    await queryInterface.removeIndex('level_rules', ['tenant_id', 'level']);
    await queryInterface.removeIndex('reward_rules', ['tenant_id', 'event_type']);
    await queryInterface.removeIndex('user_streaks', ['tenant_id', 'user_id']);
    await queryInterface.removeIndex('user_progression', ['tenant_id', 'user_id']);

    await queryInterface.dropTable('user_achievements');
    await queryInterface.dropTable('gamification_events');
    await queryInterface.dropTable('achievements');
    await queryInterface.dropTable('level_rules');
    await queryInterface.dropTable('reward_rules');
    await queryInterface.dropTable('user_streaks');
    await queryInterface.dropTable('user_progression');
  }
};
