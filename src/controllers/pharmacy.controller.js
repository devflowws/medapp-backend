const { Pharmacy, Order, Prescription, Message, sequelize } = require('../models');

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

exports.getPharmacyDashboard = async (req, res, next) => {
  try {
    const { pharmacyId } = req.params;

    // Stats du jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      pendingOrders,
      acceptedOrders,
      deliveredOrders,
      refusedOrders,
      todayOrders,
      totalRevenue
    ] = await Promise.all([
      Order.count({ where: { pharmacie_id: pharmacyId, statut: 'en_attente' } }),
      Order.count({ where: { pharmacie_id: pharmacyId, statut: 'accepte' } }),
      Order.count({ where: { pharmacie_id: pharmacyId, statut: 'livre' } }),
      Order.count({ where: { pharmacie_id: pharmacyId, statut: 'refuse' } }),
      Order.count({
        where: {
          pharmacie_id: pharmacyId,
          created_at: { [sequelize.Op.gte]: today }
        }
      }),
      Order.sum('montant_total', { where: { pharmacie_id: pharmacyId, statut: 'livre' } })
    ]);

    // Commandes récentes (dernières 10)
    const recentOrders = await Order.findAll({
      where: { pharmacie_id: pharmacyId },
      include: [{
        model: Prescription,
        attributes: ['id', 'type', 'nom_hopital']
      }],
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['id', 'statut', 'requiert_ordonnance', 'created_at']
    });

    res.json({
      status: 'success',
      data: {
        stats: {
          pending: pendingOrders || 0,
          accepted: acceptedOrders || 0,
          delivered: deliveredOrders || 0,
          refused: refusedOrders || 0,
          today: todayOrders || 0,
          revenue: totalRevenue || 0
        },
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

