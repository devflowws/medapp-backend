const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Pharmacy = sequelize.define('Pharmacy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  adresse: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  horaires: {
    type: DataTypes.STRING(255),
    allowNull: true, // ex: Lundi-Vendredi 8h-20h
  },
  telephone: {
    type: DataTypes.STRING(20),
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
  mot_de_passe: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  note: {
    type: DataTypes.DECIMAL(2, 1), // évaluation optionnelle par les patients sur 5.0
    defaultValue: 0.0,
  }
}, {
  tableName: 'pharmacies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (pharmacy) => {
      if (pharmacy.mot_de_passe) {
        const salt = await bcrypt.genSalt(12);
        pharmacy.mot_de_passe = await bcrypt.hash(pharmacy.mot_de_passe, salt);
      }
    },
    beforeUpdate: async (pharmacy) => {
      if (pharmacy.changed('mot_de_passe')) {
        const salt = await bcrypt.genSalt(12);
        pharmacy.mot_de_passe = await bcrypt.hash(pharmacy.mot_de_passe, salt);
      }
    }
  }
});

// Méthode de vérification du mot de passe
Pharmacy.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.mot_de_passe);
};

module.exports = Pharmacy;
