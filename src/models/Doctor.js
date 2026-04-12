const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  matricule: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  prenoms: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  date_naissance: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  specialite: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  grade: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  photo_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  hopital: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  qr_code_url: {
    type: DataTypes.TEXT,
    allowNull: true, // Peut être généré après la création de l'enregistrement
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'doctors',
  timestamps: true, // created_at, updated_at
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Doctor;
