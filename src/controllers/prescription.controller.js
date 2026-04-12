const { Prescription, PrescriptionItem, Doctor, Patient, Order } = require('../models');
const { sequelize } = require('../models');

// Créer une ordonnance avec ses éléments
exports.createPrescription = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { medecin_id, patient_id, type, nom_hopital, note, periode_validite, unite_periode, items } = req.body;

    // 1. Créer la prescription
    const prescription = await Prescription.create({
      medecin_id,
      patient_id,
      type,
      nom_hopital,
      note,
      periode_validite,
      unite_periode
    }, { transaction: t });

    // 2. Créer les lignes de prescription (items)
    if (items && items.length > 0) {
      const prescriptionItems = items.map(item => ({
        ...item,
        ordonnance_id: prescription.id
      }));

      await PrescriptionItem.bulkCreate(prescriptionItems, { transaction: t });
      
      // Auto-calculer le prix_total ?
      const total = items.reduce((acc, curr) => acc + parseFloat(curr.prix_unitaire || 0), 0);
      await prescription.update({ prix_total: total }, { transaction: t });
    }

    await t.commit();

    // Renvoyer l'ordonnance créée avec ses items
    const createdPrescription = await Prescription.findByPk(prescription.id, {
      include: [{ model: PrescriptionItem, as: 'items' }]
    });

    res.status(201).json({ status: 'success', data: createdPrescription });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// Obtenir une ordonnance spécifique via ID ou QR Code
exports.getPrescriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const prescription = await Prescription.findByPk(id, {
      include: [
        { model: PrescriptionItem, as: 'items' },
        { model: Doctor, as: 'medecin', attributes: ['id', 'nom', 'prenoms', 'specialite', 'hopital'] },
        { model: Patient, as: 'patient', attributes: ['id', 'nom', 'prenoms'] }
      ]
    });

    if (!prescription) {
      return res.status(404).json({ status: 'error', message: 'Ordonnance non trouvée' });
    }

    res.json({ status: 'success', data: prescription });
  } catch (error) {
    next(error);
  }
};

// Obtenir les ordonnances d'un patient connecté
exports.getPatientPrescriptions = async (req, res, next) => {
  try {
    const { patientId } = req.params; // ou req.user.id selon le middleware auth
    
    const prescriptions = await Prescription.findAll({
      where: { patient_id: patientId },
      include: [
        { model: Doctor, as: 'medecin', attributes: ['nom', 'prenoms', 'specialite'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ status: 'success', data: prescriptions });
  } catch (error) {
    next(error);
  }
};
