const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { verifyDoctor, verifyByQRCode } = require('../controllers/doctor-verify.controller');
const { protect } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Récupérer tous les médecins actifs
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Liste des médecins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       matricule:
 *                         type: string
 *                       nom:
 *                         type: string
 *                       prenoms:
 *                         type: string
 *                       specialite:
 *                         type: string
 *                       hopital:
 *                         type: string
 *       500:
 *         description: Erreur serveur
 */
router.get('/', protect(['admin', 'patient']), doctorController.getAllDoctors);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Récupérer un médecin par son ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du médecin
 *     responses:
 *       200:
 *         description: Médecin trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *       404:
 *         description: Médecin non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Médecin non trouvé"
 */
router.get('/:id', protect(['admin', 'patient']), doctorController.getDoctorById);

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Créer un nouveau médecin
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [matricule, nom, prenoms, date_naissance, email, telephone, specialite, grade, hopital]
 *             properties:
 *               matricule:
 *                 type: string
 *                 example: "MED-001"
 *               nom:
 *                 type: string
 *                 example: "Dupont"
 *               prenoms:
 *                 type: string
 *                 example: "Jean"
 *               date_naissance:
 *                 type: string
 *                 format: date
 *                 example: "1980-01-15"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@hopital.com"
 *               telephone:
 *                 type: string
 *                 example: "+33123456789"
 *               specialite:
 *                 type: string
 *                 example: "Cardiologie"
 *               grade:
 *                 type: string
 *                 example: "Professeur"
 *               hopital:
 *                 type: string
 *                 example: "Hôpital Central"
 *     responses:
 *       201:
 *         description: Médecin créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *       400:
 *         description: Un médecin avec ce matricule existe déjà
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Un médecin avec ce matricule existe déjà"
 */
router.post('/', protect(['admin']), doctorController.createDoctor);

/**
 * @swagger
 * /api/doctors/verify/{matricule}:
 *   get:
 *     summary: Vérifier un médecin par matricule (scan QR Code)
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: matricule
 *         required: true
 *         schema:
 *           type: string
 *         description: Matricule du médecin à vérifier
 *     responses:
 *       200:
 *         description: Médecin vérifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 is_valid:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Médecin vérifié avec succès"
 *                 data:
 *                   type: object
 *       404:
 *         description: Médecin non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 is_valid:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Médecin non trouvé. Vérifiez le matricule."
 *       403:
 *         description: Médecin inactif
 */
router.get('/verify/:matricule', verifyDoctor);

/**
 * @swagger
 * /api/doctors/verify-qr:
 *   post:
 *     summary: Vérifier un médecin par QR Code
 *     tags: [Doctors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qrCodeUrl]
 *             properties:
 *               qrCodeUrl:
 *                 type: string
 *                 example: "https://example.com/qr/abc123"
 *     responses:
 *       200:
 *         description: Médecin vérifié via QR Code
 */
router.post('/verify-qr', verifyByQRCode);

module.exports = router;
