const { Patient, Pharmacy } = require('../models');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/jwt.util');
const { Resend } = require('resend');

// Initialize Resend email service
const resend = new Resend(process.env.RESEND_API_KEY || '');

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email via Resend
const sendVerificationEmail = async (email, code, pharmacyName) => {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'OrdoLive <onboarding@resend.dev>',
      to: email,
      subject: 'Vérification de votre compte pharmacie - OrdoLive',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">OrdoLive</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Espace Pharmacie</p>
          </div>
          <div style="background: white; padding: 40px 30px; border: 1px solid #e8edf3; border-top: none;">
            <h2 style="color: #1e293b; margin: 0 0 16px;">Vérification de votre compte</h2>
            <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
              Bonjour <strong>${pharmacyName}</strong>,<br><br>
              Merci de vous être inscrit sur OrdoLive. Pour finaliser la création de votre compte, veuillez utiliser le code de vérification suivant :
            </p>
            <div style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">Votre code de vérification</p>
              <p style="margin: 0; font-size: 36px; font-weight: 800; color: #16a34a; letter-spacing: 8px; font-family: monospace;">${code}</p>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              Ce code expirera dans <strong>15 minutes</strong>.<br>
              Si vous n'avez pas créé de compte, ignorez simplement cet email.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e8edf3; border-top: none;">
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">© 2026 OrdoLive. Tous droits réservés.</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    // Log code in console as fallback during development
    console.log(`\n⚠️ Email non envoyé - Code pour ${email}: ${code}\n`);
    return { success: false, code };
  }
};

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
      nom, adresse, telephone, email, mot_de_passe, horaires, latitude, longitude,
      is_verified: true, // Directement vérifié
    });

    const token = generateToken(pharmacy.id, 'pharmacy');
    const refreshToken = generateRefreshToken(pharmacy.id, 'pharmacy');

    res.status(201).json({
      status: 'success',
      message: 'Compte créé avec succès',
      token,
      refreshToken,
      data: {
        id: pharmacy.id,
        nom: pharmacy.nom,
        email: pharmacy.email,
        role: 'pharmacy',
      }
    });
  } catch (error) {
    next(error);
  }
};

// Ces fonctions restent pour compatibilité mais ne sont plus utilisées
exports.verifyPharmacy = async (req, res, next) => {
  res.status(200).json({ status: 'success', message: 'Vérification non requise' });
};

exports.resendVerificationCode = async (req, res, next) => {
  res.status(200).json({ status: 'success', message: 'Non requis' });
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

