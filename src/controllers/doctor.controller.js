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

exports.updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { matricule, nom, prenoms, date_naissance, email, telephone, specialite, grade, hopital, is_active } = req.body;

    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ status: 'error', message: 'Médecin non trouvé' });
    }

    // Check matricule uniqueness if changing
    if (matricule && matricule !== doctor.matricule) {
      const exists = await Doctor.findOne({ where: { matricule } });
      if (exists) {
        return res.status(400).json({ status: 'error', message: 'Un médecin avec ce matricule existe déjà' });
      }
    }

    await doctor.update({
      matricule: matricule !== undefined ? matricule : doctor.matricule,
      nom: nom !== undefined ? nom : doctor.nom,
      prenoms: prenoms !== undefined ? prenoms : doctor.prenoms,
      date_naissance: date_naissance !== undefined ? date_naissance : doctor.date_naissance,
      email: email !== undefined ? email : doctor.email,
      telephone: telephone !== undefined ? telephone : doctor.telephone,
      specialite: specialite !== undefined ? specialite : doctor.specialite,
      grade: grade !== undefined ? grade : doctor.grade,
      hopital: hopital !== undefined ? hopital : doctor.hopital,
      is_active: is_active !== undefined ? is_active : doctor.is_active
    });

    res.json({ status: 'success', data: doctor });
  } catch (error) {
    next(error);
  }
};

exports.deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({ status: 'error', message: 'Médecin non trouvé' });
    }

    await doctor.destroy();
    res.json({ status: 'success', message: 'Médecin supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};

exports.toggleDoctorStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ status: 'error', message: 'Médecin non trouvé' });
    }

    await doctor.update({ is_active });
    res.json({ status: 'success', data: doctor });
  } catch (error) {
    next(error);
  }
};
