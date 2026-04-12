const express = require('express');
const router = express.Router();
const { getAllPharmacies, getPharmacyProfile, updatePharmacy, deletePharmacy, changePassword, getPharmacyDashboard } = require('../controllers/pharmacy.controller');
const { protect } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/pharmacies:
 *   get:
 *     summary: Récupérer toutes les pharmacies actives
 *     tags: [Pharmacies]
 *     responses:
 *       200:
 *         description: Liste des pharmacies
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
 *                       nom:
 *                         type: string
 *                       adresse:
 *                         type: string
 *                       telephone:
 *                         type: string
 *                       email:
 *                         type: string
 *                       note:
 *                         type: number
 *       500:
 *         description: Erreur serveur
 */
router.get('/', protect(['admin']), getAllPharmacies);

/**
 * @swagger
 * /api/pharmacies/{id}:
 *   get:
 *     summary: Récupérer le profil d'une pharmacie
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la pharmacie
 *     responses:
 *       200:
 *         description: Profil de la pharmacie
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
 *         description: Pharmacie non trouvée
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
 *                   example: "Pharmacie non trouvée"
 */
router.get('/:id', protect(['admin', 'pharmacy']), getPharmacyProfile);

/**
 * @swagger
 * /api/pharmacies/{id}:
 *   put:
 *     summary: Mettre à jour une pharmacie
 *     tags: [Pharmacies]
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
 *               adresse:
 *                 type: string
 *               telephone:
 *                 type: string
 *               horaires:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pharmacie mise à jour
 *       404:
 *         description: Pharmacie non trouvée
 */
router.put('/:id', protect(['admin', 'pharmacy']), updatePharmacy);

/**
 * @swagger
 * /api/pharmacies/{id}:
 *   delete:
 *     summary: Supprimer une pharmacie
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Pharmacie supprimée
 *       404:
 *         description: Pharmacie non trouvée
 */
router.delete('/:id', protect(['admin']), deletePharmacy);

/**
 * @swagger
 * /api/pharmacies/{id}/change-password:
 *   post:
 *     summary: Changer le mot de passe d'une pharmacie
 *     tags: [Pharmacies]
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
 *             required: [current_password, new_password]
 *             properties:
 *               current_password:
 *                 type: string
 *                 format: password
 *               new_password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Mot de passe modifié
 *       401:
 *         description: Mot de passe actuel incorrect
 */
router.post('/:id/change-password', protect(['admin', 'pharmacy']), changePassword);

/**
 * @swagger
 * /api/pharmacies/{pharmacyId}/dashboard:
 *   get:
 *     summary: Récupérer les statistiques du tableau de bord pharmacie
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: pharmacyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Statistiques du tableau de bord
 */
router.get('/:pharmacyId/dashboard', protect(['pharmacy']), getPharmacyDashboard);

module.exports = router;
