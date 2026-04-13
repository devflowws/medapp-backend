const { Patient } = require('../models');
const path = require('path');
const fs = require('fs');

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
    const { nom, prenoms, nom_utilisateur, email, telephone, date_naissance, adresse } = req.body;

    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({ status: 'error', message: 'Patient non trouvé' });
    }

    // Vérifier unicité si email ou nom_utilisateur changent
    if (email && email !== patient.email) {
      const exists = await Patient.findOne({ where: { email } });
      if (exists) {
        return res.status(400).json({ status: 'error', message: 'Cet email est déjà utilisé' });
      }
    }

    if (nom_utilisateur && nom_utilisateur !== patient.nom_utilisateur) {
      const exists = await Patient.findOne({ where: { nom_utilisateur } });
      if (exists) {
        return res.status(400).json({ status: 'error', message: 'Ce nom d\'utilisateur est déjà utilisé' });
      }
    }

    if (telephone && telephone !== patient.telephone) {
      const exists = await Patient.findOne({ where: { telephone } });
      if (exists) {
        return res.status(400).json({ status: 'error', message: 'Ce numéro de téléphone est déjà utilisé' });
      }
    }

    // Mettre à jour les champs autorisés
    await patient.update({
      nom: nom !== undefined ? nom : patient.nom,
      prenoms: prenoms !== undefined ? prenoms : patient.prenoms,
      nom_utilisateur: nom_utilisateur !== undefined ? nom_utilisateur : patient.nom_utilisateur,
      email: email !== undefined ? email : patient.email,
      telephone: telephone !== undefined ? telephone : patient.telephone,
      date_naissance: date_naissance !== undefined ? date_naissance : patient.date_naissance,
      adresse: adresse !== undefined ? adresse : patient.adresse,
    });

    const updatedPatient = await Patient.findByPk(id, {
      attributes: { exclude: ['mot_de_passe', 'createdAt', 'updatedAt'] }
    });

    res.json({ status: 'success', data: updatedPatient });
  } catch (error) {
    next(error);
  }
};

exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'Aucune image fournie' });
    }

    const patient = await Patient.findByPk(id);
    if (!patient) {
      // Supprimer le fichier uploadé si patient non trouvé
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ status: 'error', message: 'Patient non trouvé' });
    }

    // Supprimer l'ancienne photo si elle existe
    if (patient.photo_url) {
      const oldPath = path.join(__dirname, '..', '..', 'uploads', path.basename(patient.photo_url));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Construire l'URL de la photo
    const photoUrl = `/uploads/${req.file.filename}`;
    await patient.update({ photo_url: photoUrl });

    res.json({
      status: 'success',
      message: 'Photo de profil mise à jour',
      data: { photo_url: photoUrl }
    });
  } catch (error) {
    next(error);
  }
};

exports.removeProfilePhoto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({ status: 'error', message: 'Patient non trouvé' });
    }

    if (patient.photo_url) {
      const filePath = path.join(__dirname, '..', '..', 'uploads', path.basename(patient.photo_url));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await patient.update({ photo_url: null });
    }

    res.json({ status: 'success', message: 'Photo de profil supprimée' });
  } catch (error) {
    next(error);
  }
};
