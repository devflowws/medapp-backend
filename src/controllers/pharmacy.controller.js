const { Pharmacy } = require('../models');

exports.getAllPharmacies = async (req, res, next) => {
  try {
    const pharmacies = await Pharmacy.findAll({
      attributes: { exclude: ['mot_de_passe', 'createdAt', 'updatedAt'] },
      where: { is_active: true }
    });
    res.json({ status: 'success', data: pharmacies });
  } catch (error) {
    next(error);
  }
};

exports.getPharmacyProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pharmacy = await Pharmacy.findByPk(id, {
      attributes: { exclude: ['mot_de_passe', 'createdAt', 'updatedAt'] }
    });

    if (!pharmacy) {
      return res.status(404).json({ status: 'error', message: 'Pharmacie non trouvée' });
    }

    res.json({ status: 'success', data: pharmacy });
  } catch (error) {
    next(error);
  }
};

exports.updatePharmacy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const pharmacy = await Pharmacy.findByPk(id);
    if (!pharmacy) {
      return res.status(404).json({ status: 'error', message: 'Pharmacie non trouvée' });
    }

    // Exclure le mot de passe de cette route
    if (updates.mot_de_passe) {
      delete updates.mot_de_passe;
    }

    await pharmacy.update(updates);

    const updatedPharmacy = await Pharmacy.findByPk(id, {
      attributes: { exclude: ['mot_de_passe', 'createdAt', 'updatedAt'] }
    });

    res.json({ status: 'success', data: updatedPharmacy });
  } catch (error) {
    next(error);
  }
};

exports.deletePharmacy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pharmacy = await Pharmacy.findByPk(id);
    if (!pharmacy) {
      return res.status(404).json({ status: 'error', message: 'Pharmacie non trouvée' });
    }

    await pharmacy.destroy();

    res.json({ status: 'success', message: 'Pharmacie supprimée avec succès' });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;

    const pharmacy = await Pharmacy.findByPk(id);
    if (!pharmacy) {
      return res.status(404).json({ status: 'error', message: 'Pharmacie non trouvée' });
    }

    if (!(await pharmacy.validatePassword(current_password))) {
      return res.status(401).json({ status: 'error', message: 'Mot de passe actuel incorrect' });
    }

    pharmacy.mot_de_passe = new_password;
    await pharmacy.save();

    res.json({ status: 'success', message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    next(error);
  }
};

