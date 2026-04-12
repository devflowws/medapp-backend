const { Doctor } = require('../models');

// ===== Gestion des Médecins =====

exports.getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      where: { is_active: true }
    });
    res.json({ status: 'success', data: doctors });
  } catch (error) {
    next(error);
  }
};

exports.getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByPk(id, {
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    if (!doctor) {
      return res.status(404).json({ status: 'error', message: 'Médecin non trouvé' });
    }

    res.json({ status: 'success', data: doctor });
  } catch (error) {
    next(error);
  }
};

exports.createDoctor = async (req, res, next) => {
  try {
    const { matricule, nom, prenoms, date_naissance, email, telephone, specialite, grade, hopital } = req.body;

    const doctorExists = await Doctor.findOne({ where: { matricule } });
    if (doctorExists) {
      return res.status(400).json({ status: 'error', message: 'Un médecin avec ce matricule existe déjà' });
    }

    const doctor = await Doctor.create({
      matricule, nom, prenoms, date_naissance, email, telephone, specialite, grade, hopital
    });

    res.status(201).json({
      status: 'success',
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};
