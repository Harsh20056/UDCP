'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('projects', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      department: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      budget: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      budget_utilized: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'SUBMITTED', 'CONFLICT_ANALYSIS', 'DEPT_NOTIFIED',
          'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'),
        allowNull: false,
        defaultValue: 'DRAFT',
      },
      priority: {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        allowNull: false,
        defaultValue: 'MEDIUM',
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      road_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      progress_percent: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      assigned_officer: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      assigned_officer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_by_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    // Add PostGIS GEOMETRY column — can't do this through standard Sequelize column defs
    await queryInterface.sequelize.query(`
      ALTER TABLE projects ADD COLUMN location GEOMETRY(POINT, 4326);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('projects');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_projects_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_projects_priority";');
  },
};
