'use strict';

const { DataTypes } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('learner_profiles', {
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
      display_name: { type: DataTypes.STRING(120), allowNull: true },
      current_level: { type: DataTypes.STRING(40), allowNull: true },
      bio: { type: DataTypes.TEXT, allowNull: true },
      preferences_json: { type: DataTypes.JSONB, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('learning_goals', {
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
      title: { type: DataTypes.STRING(180), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      target_date: { type: DataTypes.DATE, allowNull: true },
      status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('learning_style_profiles', {
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
      dominant_style: { type: DataTypes.STRING(60), allowNull: false },
      style_scores_json: { type: DataTypes.JSONB, allowNull: true },
      recommendations_json: { type: DataTypes.JSONB, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('journey_plans', {
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
      learning_goal_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'learning_goals', key: 'id' },
        onDelete: 'SET NULL'
      },
      title: { type: DataTypes.STRING(180), allowNull: false },
      status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
      generated_by: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'ai' },
      metadata: { type: DataTypes.JSONB, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('scenarios', {
      id: { type: DataTypes.UUID, primaryKey: true },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE'
      },
      title: { type: DataTypes.STRING(180), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      difficulty: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'medium' },
      competency_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'competencies', key: 'id' },
        onDelete: 'SET NULL'
      },
      learning_track_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'learning_tracks', key: 'id' },
        onDelete: 'SET NULL'
      },
      course_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'courses', key: 'id' },
        onDelete: 'SET NULL'
      },
      lesson_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'lessons', key: 'id' },
        onDelete: 'SET NULL'
      },
      status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('journey_plan_steps', {
      id: { type: DataTypes.UUID, primaryKey: true },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE'
      },
      journey_plan_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'journey_plans', key: 'id' },
        onDelete: 'CASCADE'
      },
      title: { type: DataTypes.STRING(180), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      step_type: { type: DataTypes.STRING(30), allowNull: false },
      order_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
      competency_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'competencies', key: 'id' },
        onDelete: 'SET NULL'
      },
      lesson_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'lessons', key: 'id' },
        onDelete: 'SET NULL'
      },
      scenario_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'scenarios', key: 'id' },
        onDelete: 'SET NULL'
      },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('journey_states', {
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
      journey_plan_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'journey_plans', key: 'id' },
        onDelete: 'SET NULL'
      },
      current_step_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'journey_plan_steps', key: 'id' },
        onDelete: 'SET NULL'
      },
      progress_percent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      last_event_at: { type: DataTypes.DATE, allowNull: true },
      state_json: { type: DataTypes.JSONB, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('scenario_episodes', {
      id: { type: DataTypes.UUID, primaryKey: true },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE'
      },
      scenario_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'scenarios', key: 'id' },
        onDelete: 'CASCADE'
      },
      title: { type: DataTypes.STRING(180), allowNull: false },
      narrative_text: { type: DataTypes.TEXT, allowNull: false },
      episode_index: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('decision_options', {
      id: { type: DataTypes.UUID, primaryKey: true },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE'
      },
      scenario_episode_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'scenario_episodes', key: 'id' },
        onDelete: 'CASCADE'
      },
      label: { type: DataTypes.STRING(180), allowNull: false },
      outcome_text: { type: DataTypes.TEXT, allowNull: true },
      score_delta: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      metadata: { type: DataTypes.JSONB, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('simulation_runs', {
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
      scenario_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'scenarios', key: 'id' },
        onDelete: 'CASCADE'
      },
      journey_plan_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'journey_plans', key: 'id' },
        onDelete: 'SET NULL'
      },
      status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'active' },
      started_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      completed_at: { type: DataTypes.DATE, allowNull: true },
      total_score: { type: DataTypes.DECIMAL(6, 2), allowNull: false, defaultValue: 0 },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('decision_logs', {
      id: { type: DataTypes.UUID, primaryKey: true },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onDelete: 'CASCADE'
      },
      simulation_run_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'simulation_runs', key: 'id' },
        onDelete: 'CASCADE'
      },
      scenario_episode_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'scenario_episodes', key: 'id' },
        onDelete: 'CASCADE'
      },
      decision_option_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'decision_options', key: 'id' },
        onDelete: 'CASCADE'
      },
      decided_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      feedback_text: { type: DataTypes.TEXT, allowNull: true },
      score_impact: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('competency_evidences', {
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
      competency_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'competencies', key: 'id' },
        onDelete: 'SET NULL'
      },
      source_type: { type: DataTypes.STRING(40), allowNull: false },
      source_id: { type: DataTypes.UUID, allowNull: true },
      evidence_text: { type: DataTypes.TEXT, allowNull: true },
      score: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      metadata: { type: DataTypes.JSONB, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.createTable('assessment_submissions', {
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
      assessment_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'assessments', key: 'id' },
        onDelete: 'SET NULL'
      },
      assessment_attempt_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'assessment_attempts', key: 'id' },
        onDelete: 'SET NULL'
      },
      submission_text: { type: DataTypes.TEXT, allowNull: true },
      submission_json: { type: DataTypes.JSONB, allowNull: true },
      ai_score: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      ai_feedback: { type: DataTypes.TEXT, allowNull: true },
      recommendation: { type: DataTypes.TEXT, allowNull: true },
      next_step_suggestion: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });

    await queryInterface.addIndex('learner_profiles', ['tenant_id', 'user_id'], { unique: true });
    await queryInterface.addIndex('learning_goals', ['tenant_id', 'user_id', 'status']);
    await queryInterface.addIndex('learning_style_profiles', ['tenant_id', 'user_id'], { unique: true });
    await queryInterface.addIndex('journey_plans', ['tenant_id', 'user_id', 'status']);
    await queryInterface.addIndex('journey_plan_steps', ['journey_plan_id', 'order_index']);
    await queryInterface.addIndex('journey_states', ['tenant_id', 'user_id'], { unique: true });
    await queryInterface.addIndex('scenarios', ['tenant_id', 'status']);
    await queryInterface.addIndex('scenario_episodes', ['scenario_id', 'episode_index']);
    await queryInterface.addIndex('decision_options', ['scenario_episode_id']);
    await queryInterface.addIndex('simulation_runs', ['tenant_id', 'user_id', 'status']);
    await queryInterface.addIndex('decision_logs', ['simulation_run_id', 'scenario_episode_id']);
    await queryInterface.addIndex('competency_evidences', ['tenant_id', 'user_id']);
    await queryInterface.addIndex('assessment_submissions', ['tenant_id', 'user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('assessment_submissions');
    await queryInterface.dropTable('competency_evidences');
    await queryInterface.dropTable('decision_logs');
    await queryInterface.dropTable('simulation_runs');
    await queryInterface.dropTable('decision_options');
    await queryInterface.dropTable('scenario_episodes');
    await queryInterface.dropTable('journey_states');
    await queryInterface.dropTable('journey_plan_steps');
    await queryInterface.dropTable('scenarios');
    await queryInterface.dropTable('journey_plans');
    await queryInterface.dropTable('learning_style_profiles');
    await queryInterface.dropTable('learning_goals');
    await queryInterface.dropTable('learner_profiles');
  }
};
