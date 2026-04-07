'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.addColumn('journey_missions', 'track_slug', {
      type: DataTypes.STRING(120),
      allowNull: true
    });

    await queryInterface.addColumn('journey_missions', 'target_area', {
      type: DataTypes.STRING(120),
      allowNull: true
    });

    await queryInterface.addColumn('journey_missions', 'audience_styles_json', {
      type: DataTypes.JSONB,
      allowNull: true
    });

    await queryInterface.addIndex('journey_missions', ['tenant_id', 'active', 'track_slug']);
    await queryInterface.addIndex('journey_missions', ['tenant_id', 'active', 'target_area']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('journey_missions', ['tenant_id', 'active', 'target_area']);
    await queryInterface.removeIndex('journey_missions', ['tenant_id', 'active', 'track_slug']);

    await queryInterface.removeColumn('journey_missions', 'audience_styles_json');
    await queryInterface.removeColumn('journey_missions', 'target_area');
    await queryInterface.removeColumn('journey_missions', 'track_slug');
  }
};
