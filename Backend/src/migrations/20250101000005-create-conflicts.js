'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conflicts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      conflict_type: {
        type: Sequelize.ENUM('LOCATION_OVERLAP', 'TIMELINE_OVERLAP', 'SAME_ROAD_EXCAVATION', 'DUPLICATE_REQUEST'),
        allowNull: false,
      },
      conflict_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      risk_level: {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('OPEN', 'ACKNOWLEDGED', 'RESOLVED'),
        allowNull: false,
        defaultValue: 'OPEN',
      },
      departments_involved: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      suggested_actions: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      location_description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      road_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      detected_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Join table for many-to-many: projects <-> conflicts
    await queryInterface.createTable('project_conflicts', {
      project_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'projects', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      conflict_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'conflicts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    // Composite primary key
    await queryInterface.addConstraint('project_conflicts', {
      fields: ['project_id', 'conflict_id'],
      type: 'primary key',
      name: 'project_conflicts_pkey',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('project_conflicts');
    await queryInterface.dropTable('conflicts');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_conflicts_conflict_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_conflicts_risk_level";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_conflicts_status";');
  },
};
