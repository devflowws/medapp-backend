const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
// const { protect } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Créer une nouvelle ordonnance
 *     tags: [Prescriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [medecin_id, patient_id, type, nom_hopital]
 *             properties:
 *               medecin_id:
 *                 type: string
 *                 format: uuid
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [unique, periodique]
 *                 example: "unique"
 *               nom_hopital:
 *                 type: string
 *                 example: "Hôpital Central"
 *               note:
 *                 type: string
 *                 example: "Prendre après les repas"
 *               periode_validite:
 *                 type: integer
 *                 example: 30
 *               unite_periode:
 *                 type: string
 *                 enum: [jour, mois, annee]
 *                 example: "jour"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nom_medicament:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     quantite:
 *                       type: integer
 *                     prix_unitaire:
 *                       type: number
 *     responses:
 *       201:
 *         description: Ordonnance créée avec succès
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
 *         description: Erreur de validation
 */
router.post('/', prescriptionController.createPrescription);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Récupérer une ordonnance par son ID
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'ordonnance
 *     responses:
 *       200:
 *         description: Ordonnance trouvée
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
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     type:
 *                       type: string
 *                     nom_hopital:
 *                       type: string
 *                     statut:
 *                       type: string
 *                     prix_total:
 *                       type: number
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     medecin:
 *                       type: object
 *                     patient:
 *                       type: object
 *       404:
 *         description: Ordonnance non trouvée
 */
router.get('/:id', prescriptionController.getPrescriptionById);

/**
 * @swagger
 * /api/prescriptions/patient/{patientId}:
 *   get:
 *     summary: Récupérer toutes les ordonnances d'un patient
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du patient
 *     responses:
 *       200:
 *         description: Liste des ordonnances du patient
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
 *       404:
 *         description: Patient non trouvé
 */
router.get('/patient/:patientId', prescriptionController.getPatientPrescriptions);

module.exports = router;
