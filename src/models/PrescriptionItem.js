const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PrescriptionItem = sequelize.define('PrescriptionItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  ordonnance_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  nom_produit: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  medication_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  posologie: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  prix_unitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  }
}, {
  tableName: 'prescription_items',
  timestamps: false // Pas explicitement requis dans le CDC, mais peut être ajouté si nécessaire
});

module.exports = PrescriptionItem;
