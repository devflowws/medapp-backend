const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
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
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'moderateur'),
    defaultValue: 'admin',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'admins',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.mot_de_passe) {
        const salt = await bcrypt.genSalt(12);
        admin.mot_de_passe = await bcrypt.hash(admin.mot_de_passe, salt);
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('mot_de_passe')) {
        const salt = await bcrypt.genSalt(12);
        admin.mot_de_passe = await bcrypt.hash(admin.mot_de_passe, salt);
      }
    }
  }
});

// Methode de verification du mot de passe
Admin.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.mot_de_passe);
};

module.exports = Admin;
