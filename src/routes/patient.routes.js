const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Récupérer le profil d'un patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du patient
 *     responses:
 *       200:
 *         description: Profil du patient
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
 *                     nom:
 *                       type: string
 *                     prenoms:
 *                       type: string
 *                     nom_utilisateur:
 *                       type: string
 *                     email:
 *                       type: string
 *                     telephone:
 *                       type: string
 *       404:
 *         description: Patient non trouvé
 */
router.get('/:id', patientController.getPatientProfile);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Mettre à jour le profil d'un patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du patient
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenoms:
 *                 type: string
 *               telephone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour
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
 *         description: Patient non trouvé
 */
router.put('/:id', patientController.updatePatientProfile);

module.exports = router;
