const { Order, Prescription, Patient, Pharmacy } = require('../models');

// Création d'une commande par un patient
exports.createOrder = async (req, res, next) => {
  try {
    const { ordonnance_id, pharmacie_id, patient_id, requiert_ordonnance } = req.body;

    // TODO: S'il requiert_ordonnance, on pourrait vérifier la validité de l'ordonnance
    if (requiert_ordonnance && !ordonnance_id) {
      return res.status(400).json({ status: 'error', message: 'L\'ordonnance est requise' });
    }

    const order = await Order.create({
      ordonnance_id,
      pharmacie_id,
      patient_id,
      requiert_ordonnance,
      statut: 'en_attente'
    });

    res.status(201).json({ status: 'success', data: order });
  } catch (error) {
    next(error);
  }
};

// Récupérer les commandes d'une pharmacie
exports.getPharmacyOrders = async (req, res, next) => {
  try {
    const { pharmacyId } = req.params;
    const orders = await Order.findAll({
      where: { pharmacie_id: pharmacyId },
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'nom', 'prenoms', 'telephone'] },
        { model: Prescription, as: 'ordonnance', attributes: ['id', 'type', 'prix_total'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ status: 'success', data: orders });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour le statut d'une commande
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statut, message_pharmacie } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Commande non trouvée' });
    }

    const validStatuses = ['en_attente', 'accepte', 'indisponible', 'livre', 'refuse'];
    if (!validStatuses.includes(statut)) {
      return res.status(400).json({ status: 'error', message: 'Statut invalide' });
    }

    order.statut = statut;
    if (message_pharmacie !== undefined) {
      order.message_pharmacie = message_pharmacie;
    }

    await order.save();

    // S'il est accepté et il y a une ordonnance, on pourrait marquer l'ordonnance 'utilisee' si type=='unique'
    if (statut === 'livre' && order.ordonnance_id) {
      const pres = await Prescription.findByPk(order.ordonnance_id);
      if (pres && pres.type === 'unique') {
        pres.statut = 'utilisee';
        await pres.save();
      }
    }

    res.json({ status: 'success', data: order });
  } catch (error) {
    next(error);
  }
};

// Récupérer les commandes d'un patient
exports.getPatientOrders = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const orders = await Order.findAll({
      where: { patient_id: patientId },
      include: [
        { model: Pharmacy, as: 'pharmacie', attributes: ['id', 'nom', 'adresse', 'telephone'] },
        { model: Prescription, as: 'ordonnance', attributes: ['id', 'type'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ status: 'success', data: orders });
  } catch (error) {
    next(error);
  }
};
