'use strict';

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    budget: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    budget_utilized: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'CONFLICT_ANALYSIS', 'DEPT_NOTIFIED',
        'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'),
      allowNull: false,
      defaultValue: 'DRAFT',
    },
    priority: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
      allowNull: false,
      defaultValue: 'MEDIUM',
    },
    // location is a GEOMETRY column — managed via raw SQL, not Sequelize DataTypes
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    road_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    progress_percent: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    assigned_officer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assigned_officer_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    created_by_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  }, {
    tableName: 'projects',
    underscored: true,
    timestamps: true,
  });

  return Project;
};
