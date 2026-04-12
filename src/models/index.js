const sequelize = require('../config/database');

// Importation des modèles
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Pharmacy = require('./Pharmacy');
const Prescription = require('./Prescription');
const PrescriptionItem = require('./PrescriptionItem');
const Order = require('./Order');
const Message = require('./Message');
const OtpToken = require('./OtpToken');
const AuditLog = require('./AuditLog');

// Définitions des relations (Associations Sequelize)

// Doctor <-> Prescription (1:N)
Doctor.hasMany(Prescription, { foreignKey: 'medecin_id', as: 'prescriptions' });
Prescription.belongsTo(Doctor, { foreignKey: 'medecin_id', as: 'medecin' });

// Patient <-> Prescription (1:N)
Patient.hasMany(Prescription, { foreignKey: 'patient_id', as: 'prescriptions' });
Prescription.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Prescription <-> PrescriptionItem (1:N)
Prescription.hasMany(PrescriptionItem, { foreignKey: 'ordonnance_id', as: 'items', onDelete: 'CASCADE' });
PrescriptionItem.belongsTo(Prescription, { foreignKey: 'ordonnance_id', as: 'ordonnance' });

// Prescription <-> Order (1:N) - Une ordonnance peut avoir plusieurs commandes (si refusées par ex.) mais souvent 1 active
Prescription.hasMany(Order, { foreignKey: 'ordonnance_id', as: 'orders' });
Order.belongsTo(Prescription, { foreignKey: 'ordonnance_id', as: 'ordonnance' });

// Patient <-> Order (1:N)
Patient.hasMany(Order, { foreignKey: 'patient_id', as: 'orders' });
Order.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Pharmacy <-> Order (1:N)
Pharmacy.hasMany(Order, { foreignKey: 'pharmacie_id', as: 'orders' });
Order.belongsTo(Pharmacy, { foreignKey: 'pharmacie_id', as: 'pharmacie' });

// Order <-> Message (1:N)
Order.hasMany(Message, { foreignKey: 'order_id', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

module.exports = {
  sequelize,
  Doctor,
  Patient,
  Pharmacy,
  Prescription,
  PrescriptionItem,
  Order,
  Message,
  OtpToken,
  AuditLog
};
