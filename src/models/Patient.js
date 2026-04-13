const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  prenoms: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  nom_utilisateur: {
    type: DataTypes.STRING(80),
    unique: true,
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
    unique: true,
    allowNull: false,
  },
  photo_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date_naissance: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  adresse: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  mot_de_passe: {
    type: DataTypes.STRING(255),
    allowNull: false,
  }
}, {
  tableName: 'patients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (patient) => {
      if (patient.mot_de_passe) {
        const salt = await bcrypt.genSalt(12);
        patient.mot_de_passe = await bcrypt.hash(patient.mot_de_passe, salt);
      }
    },
    beforeUpdate: async (patient) => {
      if (patient.changed('mot_de_passe')) {
        const salt = await bcrypt.genSalt(12);
        patient.mot_de_passe = await bcrypt.hash(patient.mot_de_passe, salt);
      }
    }
  }
});

// Méthode de vérification du mot de passe
Patient.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.mot_de_passe);
};

module.exports = Patient;
