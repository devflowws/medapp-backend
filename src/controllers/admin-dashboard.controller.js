const { Doctor, Patient, Pharmacy, Prescription, Order, AuditLog, Admin } = require('../models');
const { sequelize } = require('../models');

// ===== Statistiques Globales =====
exports.getDashboardStats = async (req, res, next) => {
  try {
    const doctorsCount = await Doctor.count();
    const activeDoctors = await Doctor.count({ where: { is_active: true } });
    const patientsCount = await Patient.count();
    const pharmaciesCount = await Pharmacy.count();
    const activePharmacies = await Pharmacy.count({ where: { is_active: true } });
    const prescriptionsCount = await Prescription.count();
    const activePrescriptions = await Prescription.count({ where: { statut: 'active' } });
    const ordersCount = await Order.count();
    const pendingOrders = await Order.count({ where: { statut: 'en_attente' } });
    const deliveredOrders = await Order.count({ where: { statut: 'livre' } });
    const adminsCount = await Admin.count();

    // Revenus (somme des prix des commandes livrées)
    const revenueResult = await Order.findOne({
      where: { statut: 'livre' },
      attributes: [
        [sequelize.fn('SUM', sequelize.literal('(SELECT prix_total FROM prescriptions WHERE prescriptions.id = orders.ordonnance_id)')), 'total_revenue']
      ],
      raw: true
    });

    // Activite recente (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await AuditLog.findAll({
      order: [['created_at', 'DESC']],
      limit: 20,
      where: sequelize.where(
        sequelize.col('created_at'),
        '>=',
        sevenDaysAgo
      )
    });

    // Top 5 pharmacies avec le plus de commandes
    const topPharmacies = await Order.findAll({
      attributes: [
        'pharmacie_id',
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'order_count']
      ],
      include: [{
        model: Pharmacy,
        as: 'pharmacie',
        attributes: ['nom', 'adresse']
      }],
      group: ['pharmacie_id', 'pharmacie.id'],
      order: [[sequelize.literal('order_count'), 'DESC']],
      limit: 5,
      raw: true
    });

    // Top 5 medecins avec le plus d'ordonnances
    const topDoctors = await Prescription.findAll({
      attributes: [
        'medecin_id',
        [sequelize.fn('COUNT', sequelize.col('Prescription.id')), 'prescription_count']
      ],
      include: [{
        model: Doctor,
        as: 'medecin',
        attributes: ['nom', 'prenoms', 'specialite']
      }],
      group: ['medecin_id', 'medecin.id'],
      order: [[sequelize.literal('prescription_count'), 'DESC']],
      limit: 5,
      raw: true
    });

    res.json({
      status: 'success',
      data: {
        overview: {
          doctors: { total: doctorsCount, active: activeDoctors },
          patients: { total: patientsCount },
          pharmacies: { total: pharmaciesCount, active: activePharmacies },
          prescriptions: { total: prescriptionsCount, active: activePrescriptions },
          orders: { 
            total: ordersCount, 
            pending: pendingOrders, 
            delivered: deliveredOrders 
          },
          admins: { total: adminsCount },
          revenue: revenueResult?.dataValues?.total_revenue || 0
        },
        topPharmacies,
        topDoctors,
        recentActivity: recentActivity.map(log => ({
          id: log.id,
          action: log.action,
          user_type: log.user_type,
          details: log.details,
          created_at: log.created_at
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// ===== Liste de tous les utilisateurs (paginee) =====
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, search } = req.query;
    const offset = (page - 1) * limit;

    const users = { doctors: [], patients: [], pharmacies: [], admins: [] };
    const counts = {};

    // Doctors
    if (!type || type === 'doctor') {
      const whereClause = {};
      if (search) {
        whereClause[sequelize.Op.or] = [
          { nom: { [sequelize.Op.iLike]: `%${search}%` } },
          { prenoms: { [sequelize.Op.iLike]: `%${search}%` } },
          { matricule: { [sequelize.Op.iLike]: `%${search}%` } },
        ];
      }

      const doctors = await Doctor.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'matricule', 'nom', 'prenoms', 'specialite', 'is_active', 'created_at']
      });

      users.doctors = doctors.rows;
      counts.doctors = doctors.count;
    }

    // Patients
    if (!type || type === 'patient') {
      const whereClause = {};
      if (search) {
        whereClause[sequelize.Op.or] = [
          { nom: { [sequelize.Op.iLike]: `%${search}%` } },
          { prenoms: { [sequelize.Op.iLike]: `%${search}%` } },
          { email: { [sequelize.Op.iLike]: `%${search}%` } },
        ];
      }

      const patients = await Patient.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'nom', 'prenoms', 'email', 'telephone', 'created_at']
      });

      users.patients = patients.rows;
      counts.patients = patients.count;
    }

    // Pharmacies
    if (!type || type === 'pharmacy') {
      const whereClause = {};
      if (search) {
        whereClause[sequelize.Op.or] = [
          { nom: { [sequelize.Op.iLike]: `%${search}%` } },
          { email: { [sequelize.Op.iLike]: `%${search}%` } },
        ];
      }

      const pharmacies = await Pharmacy.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'nom', 'adresse', 'email', 'telephone', 'is_active', 'created_at']
      });

      users.pharmacies = pharmacies.rows;
      counts.pharmacies = pharmacies.count;
    }

    // Admins
    if (!type || type === 'admin') {
      const whereClause = {};
      if (search) {
        whereClause[sequelize.Op.or] = [
          { nom: { [sequelize.Op.iLike]: `%${search}%` } },
          { email: { [sequelize.Op.iLike]: `%${search}%` } },
        ];
      }

      const admins = await Admin.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'nom', 'prenoms', 'email', 'role', 'is_active', 'created_at']
      });

      users.admins = admins.rows;
      counts.admins = admins.count;
    }

    res.json({
      status: 'success',
      data: {
        users,
        counts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ===== Desactiver/Activer un utilisateur =====
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type, is_active } = req.body;

    let model;
    if (type === 'doctor') model = Doctor;
    else if (type === 'pharmacy') model = Pharmacy;
    else if (type === 'admin') model = Admin;
    else {
      return res.status(400).json({ status: 'error', message: 'Type d\'utilisateur invalide' });
    }

    const user = await model.findByPk(id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé' });
    }

    user.is_active = is_active !== undefined ? is_active : !user.is_active;
    await user.save();

    res.json({
      status: 'success',
      message: `Utilisateur ${user.is_active ? 'activé' : 'désactivé'}`,
      data: { id: user.id, is_active: user.is_active }
    });
  } catch (error) {
    next(error);
  }
};

// ===== Supprimer un utilisateur =====
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    let model;
    if (type === 'doctor') model = Doctor;
    else if (type === 'pharmacy') model = Pharmacy;
    else if (type === 'admin') model = Admin;
    else if (type === 'patient') model = Patient;
    else {
      return res.status(400).json({ status: 'error', message: 'Type d\'utilisateur invalide' });
    }

    const user = await model.findByPk(id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Utilisateur non trouvé' });
    }

    await user.destroy();

    res.json({
      status: 'success',
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};
