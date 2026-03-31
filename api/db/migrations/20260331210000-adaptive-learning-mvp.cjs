'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('competencies', 'type', {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'hard'
    });

    await queryInterface.addColumn('competencies', 'dimensions_json', {
      type: DataTypes.JSONB,
      allowNull: true
    });

    await queryInterface.addColumn('user_competency_scores', 'level', {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'iniciante'
    });

    await queryInterface.addColumn('user_competency_scores', 'evidences_json', {
      type: DataTypes.JSONB,
      allowNull: true
    });

    await queryInterface.addColumn('learner_profiles', 'context_type', {
      type: DataTypes.STRING(20),
      allowNull: true
    });

    await queryInterface.addColumn('learner_profiles', 'area', {
      type: DataTypes.STRING(120),
      allowNull: true
    });

    await queryInterface.addColumn('learner_profiles', 'experience_level', {
      type: DataTypes.STRING(40),
      allowNull: true
    });

    await queryInterface.addColumn('learner_profiles', 'primary_objective', {
      type: DataTypes.STRING(200),
      allowNull: true
    });

    await queryInterface.addColumn('learning_goals', 'goal_type', {
      type: DataTypes.STRING(60),
      allowNull: true
    });

    await queryInterface.addColumn('learning_style_profiles', 'content_preference', {
      type: DataTypes.STRING(60),
      allowNull: true
    });

    await queryInterface.addColumn('learning_style_profiles', 'mentorship_style', {
      type: DataTypes.STRING(30),
      allowNull: true
    });

    await queryInterface.addColumn('learning_style_profiles', 'simulation_format', {
      type: DataTypes.STRING(60),
      allowNull: true
    });

    await queryInterface.addColumn('scenarios', 'context', {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('scenarios', 'problem', {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('scenarios', 'consequences_json', {
      type: DataTypes.JSONB,
      allowNull: true
    });

    await queryInterface.addColumn('scenarios', 'competencies_evaluated_json', {
      type: DataTypes.JSONB,
      allowNull: true
    });

    await queryInterface.addColumn('decision_logs', 'impact_json', {
      type: DataTypes.JSONB,
      allowNull: true
    });

    await queryInterface.addColumn('decision_logs', 'feedback_style', {
      type: DataTypes.STRING(30),
      allowNull: true
    });

    await queryInterface.addIndex('competencies', ['tenant_id', 'type']);
    await queryInterface.addIndex('user_competency_scores', ['tenant_id', 'user_id', 'level']);
    await queryInterface.addIndex('scenarios', ['tenant_id', 'difficulty']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('scenarios', ['tenant_id', 'difficulty']);
    await queryInterface.removeIndex('user_competency_scores', ['tenant_id', 'user_id', 'level']);
    await queryInterface.removeIndex('competencies', ['tenant_id', 'type']);

    await queryInterface.removeColumn('decision_logs', 'feedback_style');
    await queryInterface.removeColumn('decision_logs', 'impact_json');

    await queryInterface.removeColumn('scenarios', 'competencies_evaluated_json');
    await queryInterface.removeColumn('scenarios', 'consequences_json');
    await queryInterface.removeColumn('scenarios', 'problem');
    await queryInterface.removeColumn('scenarios', 'context');

    await queryInterface.removeColumn('learning_style_profiles', 'simulation_format');
    await queryInterface.removeColumn('learning_style_profiles', 'mentorship_style');
    await queryInterface.removeColumn('learning_style_profiles', 'content_preference');

    await queryInterface.removeColumn('learning_goals', 'goal_type');

    await queryInterface.removeColumn('learner_profiles', 'primary_objective');
    await queryInterface.removeColumn('learner_profiles', 'experience_level');
    await queryInterface.removeColumn('learner_profiles', 'area');
    await queryInterface.removeColumn('learner_profiles', 'context_type');

    await queryInterface.removeColumn('user_competency_scores', 'evidences_json');
    await queryInterface.removeColumn('user_competency_scores', 'level');

    await queryInterface.removeColumn('competencies', 'dimensions_json');
    await queryInterface.removeColumn('competencies', 'type');
  }
};