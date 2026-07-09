'use strict';

module.exports = (sequelize, DataTypes) => {
  const Conflict = sequelize.define('Conflict', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conflict_type: {
      type: DataTypes.ENUM('LOCATION_OVERLAP', 'TIMELINE_OVERLAP', 'SAME_ROAD_EXCAVATION', 'DUPLICATE_REQUEST'),
      allowNull: false,
    },
    conflict_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    risk_level: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'ACKNOWLEDGED', 'RESOLVED'),
      allowNull: false,
      defaultValue: 'OPEN',
    },
    departments_involved: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    suggested_actions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    location_description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    road_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    detected_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'conflicts',
    underscored: true,
    timestamps: true,
  });

  return Conflict;
};
