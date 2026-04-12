const { Patient, Prescription, Order } = require('../models');

exports.getPatientProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByPk(id, {
      attributes: { exclude: ['mot_de_passe', 'createdAt', 'updatedAt'] }
    });

    if (!patient) {
      return res.status(404).json({ status: 'error', message: 'Patient non trouvé' });
    }

    res.json({ status: 'success', data: patient });
  } catch (error) {
    next(error);
  }
};

exports.updatePatientProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({ status: 'error', message: 'Patient non trouvé' });
    }

    // Exclure la mise à jour du mot de passe via cette route courante
    if (updates.mot_de_passe) {
      delete updates.mot_de_passe;
    }

    await patient.update(updates);

    const patientUpdated = await Patient.findByPk(id, {
      attributes: { exclude: ['mot_de_passe', 'createdAt', 'updatedAt'] }
    });

    res.json({ status: 'success', data: patientUpdated });
  } catch (error) {
    next(error);
  }
};
