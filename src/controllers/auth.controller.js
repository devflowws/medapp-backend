const { Patient, Pharmacy } = require('../models');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/jwt.util');

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
    const refreshToken = generateRefreshToken(patient.id, 'patient');

    res.status(201).json({
      status: 'success',
      token,
      refreshToken,
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
    const { identifiant, mot_de_passe } = req.body;

    let patient = await Patient.findOne({ where: { email: identifiant } });
    if (!patient) patient = await Patient.findOne({ where: { nom_utilisateur: identifiant } });
    if (!patient) patient = await Patient.findOne({ where: { telephone: identifiant } });

    if (!patient || !(await patient.validatePassword(mot_de_passe))) {
      return res.status(401).json({ status: 'error', message: 'Identifiants incorrects' });
    }

    const token = generateToken(patient.id, 'patient');
    const refreshToken = generateRefreshToken(patient.id, 'patient');

    res.json({
      status: 'success',
      token,
      refreshToken,
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

exports.registerPharmacy = async (req, res, next) => {
  try {
    const { nom, adresse, telephone, email, mot_de_passe, horaires, latitude, longitude } = req.body;

    const pharmacyExists = await Pharmacy.findOne({ where: { email } });
    if (pharmacyExists) {
      return res.status(400).json({ status: 'error', message: 'Cet email est déjà utilisé' });
    }

    const pharmacy = await Pharmacy.create({
      nom, adresse, telephone, email, mot_de_passe, horaires, latitude, longitude
    });

    const token = generateToken(pharmacy.id, 'pharmacy');
    const refreshToken = generateRefreshToken(pharmacy.id, 'pharmacy');

    res.status(201).json({
      status: 'success',
      token,
      refreshToken,
      data: {
        id: pharmacy.id,
        nom: pharmacy.nom,
        adresse: pharmacy.adresse,
        telephone: pharmacy.telephone,
        role: 'pharmacy'
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.loginPharmacy = async (req, res, next) => {
  try {
    const { email, mot_de_passe } = req.body;

    const pharmacy = await Pharmacy.findOne({ where: { email } });

    if (!pharmacy || !(await pharmacy.validatePassword(mot_de_passe))) {
      return res.status(401).json({ status: 'error', message: 'Identifiants incorrects' });
    }

    if (!pharmacy.is_active) {
      return res.status(403).json({ status: 'error', message: 'Pharmacie désactivée' });
    }

    const token = generateToken(pharmacy.id, 'pharmacy');
    const refreshToken = generateRefreshToken(pharmacy.id, 'pharmacy');

    res.json({
      status: 'success',
      token,
      refreshToken,
      data: {
        id: pharmacy.id,
        nom: pharmacy.nom,
        adresse: pharmacy.adresse,
        role: 'pharmacy'
      }
    });
  } catch (error) {
    next(error);
  }
};

// ===== Refresh Token =====
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ status: 'error', message: 'Refresh token requis' });
    }

    const decoded = verifyToken(refreshToken);

    const newToken = generateToken(decoded.id, decoded.role);
    const newRefreshToken = generateRefreshToken(decoded.id, decoded.role);

    res.json({
      status: 'success',
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Refresh token invalide ou expiré' });
  }
};

