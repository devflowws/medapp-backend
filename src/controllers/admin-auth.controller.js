const { Admin } = require('../models');
const { generateToken, generateRefreshToken } = require('../utils/jwt.util');

// ===== Inscription Admin =====
exports.registerAdmin = async (req, res, next) => {
  try {
    const { nom, prenoms, email, mot_de_passe, role } = req.body;

    const adminExists = await Admin.findOne({ where: { email } });
    if (adminExists) {
      return res.status(400).json({ status: 'error', message: 'Cet email est déjà utilisé' });
    }

    const admin = await Admin.create({
      nom, prenoms, email, mot_de_passe, role: role || 'admin'
    });

    const token = generateToken(admin.id, 'admin');
    const refreshToken = generateRefreshToken(admin.id, 'admin');

    res.status(201).json({
      status: 'success',
      token,
      refreshToken,
      data: {
        id: admin.id,
        nom: admin.nom,
        prenoms: admin.prenoms,
        email: admin.email,
        role: admin.role,
      }
    });
  } catch (error) {
    next(error);
  }
};

// ===== Connexion Admin =====
exports.loginAdmin = async (req, res, next) => {
  try {
    const { email, mot_de_passe } = req.body;

    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(401).json({ status: 'error', message: 'Identifiants incorrects' });
    }

    if (!admin.is_active) {
      return res.status(403).json({ status: 'error', message: 'Compte désactivé. Contactez un super_admin.' });
    }

    if (!(await admin.validatePassword(mot_de_passe))) {
      return res.status(401).json({ status: 'error', message: 'Identifiants incorrects' });
    }

    const token = generateToken(admin.id, 'admin');
    const refreshToken = generateRefreshToken(admin.id, 'admin');

    res.json({
      status: 'success',
      token,
      refreshToken,
      data: {
        id: admin.id,
        nom: admin.nom,
        prenoms: admin.prenoms,
        email: admin.email,
        role: admin.role,
      }
    });
  } catch (error) {
    next(error);
  }
};

// ===== Profil Admin =====
exports.getAdminProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByPk(id, {
      attributes: { exclude: ['mot_de_passe', 'createdAt', 'updatedAt'] }
    });

    if (!admin) {
      return res.status(404).json({ status: 'error', message: 'Admin non trouvé' });
    }

    res.json({ status: 'success', data: admin });
  } catch (error) {
    next(error);
  }
};

// ===== Mettre à jour Admin =====
exports.updateAdminProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ status: 'error', message: 'Admin non trouvé' });
    }

    // Exclure le mot de passe de cette route
    if (updates.mot_de_passe) {
      delete updates.mot_de_passe;
    }

    await admin.update(updates);

    const updatedAdmin = await Admin.findByPk(id, {
      attributes: { exclude: ['mot_de_passe', 'createdAt', 'updatedAt'] }
    });

    res.json({ status: 'success', data: updatedAdmin });
  } catch (error) {
    next(error);
  }
};

// ===== Changer le mot de passe =====
exports.changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ status: 'error', message: 'Admin non trouvé' });
    }

    if (!(await admin.validatePassword(current_password))) {
      return res.status(401).json({ status: 'error', message: 'Mot de passe actuel incorrect' });
    }

    admin.mot_de_passe = new_password;
    await admin.save();

    res.json({ status: 'success', message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    next(error);
  }
};
