const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  action: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  user_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  details: {
    type: DataTypes.JSONB, // Pour PostgreSQL
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING(50),
    allowNull: true,
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = AuditLog;
