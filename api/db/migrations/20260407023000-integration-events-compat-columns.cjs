'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;
    const table = await queryInterface.describeTable('integration_events');

    if (!table.provider) {
      await queryInterface.addColumn('integration_events', 'provider', {
        type: DataTypes.STRING(50),
        allowNull: true
      });
    }

    if (!table.event_name) {
      await queryInterface.addColumn('integration_events', 'event_name', {
        type: DataTypes.STRING(120),
        allowNull: true
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('integration_events');

    if (table.event_name) {
      await queryInterface.removeColumn('integration_events', 'event_name');
    }

    if (table.provider) {
      await queryInterface.removeColumn('integration_events', 'provider');
    }
  }
};
