const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  medecin_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: true, // Peut être NULL si l'ordonnance est générée avant le rattachement
  },
  type: {
    type: DataTypes.ENUM('unique', 'periodique'),
    allowNull: false,
  },
  nom_hopital: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  periode_validite: {
    type: DataTypes.INTEGER,
    allowNull: true, // NULL si 'unique'
  },
  unite_periode: {
    type: DataTypes.ENUM('jour', 'mois', 'annee'),
    allowNull: true, // NULL si 'unique'
  },
  date_expiration: {
    type: DataTypes.DATEONLY,
    allowNull: true, // Auto-calculé en cas de périodique
  },
  statut: {
    type: DataTypes.ENUM('active', 'expiree', 'utilisee'),
    defaultValue: 'active',
  },
  prix_total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  }
}, {
  tableName: 'prescriptions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Prescription;
