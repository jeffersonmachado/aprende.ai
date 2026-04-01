'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('journey_rewards', {
      id: { type: DataTypes.STRING(120), primaryKey: true },
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
      type: { type: DataTypes.STRING(20), allowNull: false },
      title: { type: DataTypes.STRING(180), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      rarity: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'common' },
      source: { type: DataTypes.STRING(20), allowNull: false },
      step_id: { type: DataTypes.STRING(40), allowNull: true },
      effect: { type: DataTypes.JSONB, allowNull: true },
      unlocked_at: { type: DataTypes.DATE, allowNull: true },
      claimed_at: { type: DataTypes.DATE, allowNull: true },
      claimed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('journey_events', {
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
      journey_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'journey_states', key: 'id' },
        onDelete: 'SET NULL'
      },
      event_type: { type: DataTypes.STRING(40), allowNull: false },
      step_id: { type: DataTypes.STRING(40), allowNull: true },
      xp_gained: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      streak: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      metadata: { type: DataTypes.JSONB, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('mentor_states', {
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
      last_message: { type: DataTypes.TEXT, allowNull: true },
      tone: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'coach' },
      context: { type: DataTypes.JSONB, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('mentor_states');
    await queryInterface.dropTable('journey_events');
    await queryInterface.dropTable('journey_rewards');
  }
};
