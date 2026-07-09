'use strict';

module.exports = (sequelize, DataTypes) => {
  const CommunicationLog = sequelize.define('CommunicationLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    channel: {
      type: DataTypes.ENUM('EMAIL', 'SMS'),
      allowNull: false,
    },
    recipient: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    related_notification_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'communication_logs',
    underscored: true,
    timestamps: false,
  });

  return CommunicationLog;
};
