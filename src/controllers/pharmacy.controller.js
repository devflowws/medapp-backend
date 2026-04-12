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
