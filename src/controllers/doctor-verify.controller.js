const { Doctor } = require('../models');

// ===== Verifier un medecin par matricule (scan QR) =====
exports.verifyDoctor = async (req, res, next) => {
  try {
    const { matricule } = req.params;

    if (!matricule) {
      return res.status(400).json({ status: 'error', message: 'Matricule requis' });
    }

    const doctor = await Doctor.findOne({
      where: { matricule },
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    if (!doctor) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Médecin non trouvé. Vérifiez le matricule.',
        is_valid: false
      });
    }

    if (!doctor.is_active) {
      return res.status(403).json({ 
        status: 'warning', 
        message: 'Ce médecin est inactif',
        is_valid: false,
        data: {
          matricule: doctor.matricule,
          nom: doctor.nom,
          prenoms: doctor.prenoms,
          specialite: doctor.specialite,
          is_active: doctor.is_active
        }
      });
    }

    res.json({
      status: 'success',
      message: 'Médecin vérifié avec succès',
      is_valid: true,
      data: {
        id: doctor.id,
        matricule: doctor.matricule,
        nom: doctor.nom,
        prenoms: doctor.prenoms,
        date_naissance: doctor.date_naissance,
        email: doctor.email,
        telephone: doctor.telephone,
        specialite: doctor.specialite,
        grade: doctor.grade,
        hopital: doctor.hopital,
        photo_url: doctor.photo_url,
        is_active: doctor.is_active
      }
    });
  } catch (error) {
    next(error);
  }
};

// ===== Verifier par QR Code URL =====
exports.verifyByQRCode = async (req, res, next) => {
  try {
    const { qrCodeUrl } = req.body;

    if (!qrCodeUrl) {
      return res.status(400).json({ status: 'error', message: 'URL du QR Code requise' });
    }

    const doctor = await Doctor.findOne({
      where: { qr_code_url: qrCodeUrl },
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    if (!doctor) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Aucun médecin associé à ce QR Code',
        is_valid: false
      });
    }

    res.json({
      status: 'success',
      is_valid: true,
      message: 'Médecin vérifié via QR Code',
      data: {
        id: doctor.id,
        matricule: doctor.matricule,
        nom: doctor.nom,
        prenoms: doctor.prenoms,
        specialite: doctor.specialite,
        grade: doctor.grade,
        hopital: doctor.hopital,
        is_active: doctor.is_active
      }
    });
  } catch (error) {
    next(error);
  }
};
