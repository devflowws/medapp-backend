const { Patient, Pharmacy } = require('../models');
const { generateToken } = require('../utils/jwt.util');

// ===== Authentification Patient =====

exports.registerPatient = async (req, res, next) => {
  try {
    const { nom, prenoms, nom_utilisateur, email, telephone, mot_de_passe } = req.body;

    const patientExists = await Patient.findOne({ where: { email } });
    if (patientExists) {
      return res.status(400).json({ status: 'error', message: 'Cet email est déjà utilisé' });
    }

    const patient = await Patient.create({
      nom, prenoms, nom_utilisateur, email, telephone, mot_de_passe
    });

    const token = generateToken(patient.id, 'patient');

    res.status(201).json({
      status: 'success',
      token,
      data: {
        id: patient.id,
        nom: patient.nom,
        prenoms: patient.prenoms,
        role: 'patient'
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.loginPatient = async (req, res, next) => {
  try {
    const { identifiant, mot_de_passe } = req.body; // identifiant = email, tel ou username

    let patient = await Patient.findOne({ where: { email: identifiant } });
    if (!patient) patient = await Patient.findOne({ where: { nom_utilisateur: identifiant } });
    if (!patient) patient = await Patient.findOne({ where: { telephone: identifiant } });

    if (!patient || !(await patient.validatePassword(mot_de_passe))) {
      return res.status(401).json({ status: 'error', message: 'Identifiants incorrects' });
    }

    const token = generateToken(patient.id, 'patient');

    res.json({
      status: 'success',
      token,
      data: {
        id: patient.id,
        nom: patient.nom,
        prenoms: patient.prenoms,
        role: 'patient'
      }
    });
  } catch (error) {
    next(error);
  }
};

// ===== Authentification Pharmacie =====

exports.loginPharmacy = async (req, res, next) => {
  try {
    const { email, mot_de_passe } = req.body;

    const pharmacy = await Pharmacy.findOne({ where: { email } });

    if (!pharmacy || !(await pharmacy.validatePassword(mot_de_passe))) {
      return res.status(401).json({ status: 'error', message: 'Identifiants incorrects' });
    }

    const token = generateToken(pharmacy.id, 'pharmacy');

    res.json({
      status: 'success',
      token,
      data: {
        id: pharmacy.id,
        nom: pharmacy.nom,
        role: 'pharmacy'
      }
    });
  } catch (error) {
    next(error);
  }
};
