const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OtpToken = sequelize.define('OtpToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  user_type: {
    type: DataTypes.ENUM('patient', 'doctor', 'pharmacy', 'admin'),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(6),
    allowNull: false,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'otp_tokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = OtpToken;
