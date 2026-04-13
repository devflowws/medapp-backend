const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const upload = require('../middlewares/upload.middleware');
const { protect } = require('../middlewares/auth.middleware');

// Toutes les routes nécessitent une authentification patient
router.use(protect(['patient']));

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
 *     responses:
 *       200:
 *         description: Profil du patient
 *       404:
 *         description: Patient non trouvé
 */
router.get('/:id', patientController.getPatientProfile);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Mettre à jour le profil d'un patient (tous les champs)
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *               nom_utilisateur:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *               date_naissance:
 *                 type: string
 *                 format: date
 *               adresse:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       400:
 *         description: Champ déjà utilisé
 *       404:
 *         description: Patient non trouvé
 */
router.put('/:id', patientController.updatePatientProfile);

/**
 * @swagger
 * /api/patients/{id}/photo:
 *   post:
 *     summary: Uploader une photo de profil
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Image (JPG, PNG, WEBP, GIF - max 5MB)
 *     responses:
 *       200:
 *         description: Photo mise à jour
 *       400:
 *         description: Format invalide ou taille trop grande
 */
router.post('/:id/photo', upload.single('photo'), patientController.uploadProfilePhoto);

/**
 * @swagger
 * /api/patients/{id}/photo:
 *   delete:
 *     summary: Supprimer la photo de profil
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Photo supprimée
 */
router.delete('/:id/photo', patientController.removeProfilePhoto);

module.exports = router;
