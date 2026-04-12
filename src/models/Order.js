const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  ordonnance_id: {
    type: DataTypes.UUID,
    allowNull: true, // Si requiert_ordonnance est false
  },
  pharmacie_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  statut: {
    type: DataTypes.ENUM('en_attente', 'accepte', 'indisponible', 'livre', 'refuse'),
    defaultValue: 'en_attente',
  },
  requiert_ordonnance: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  message_pharmacie: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Order;
