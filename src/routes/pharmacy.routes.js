const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacy.controller');

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
router.get('/', pharmacyController.getAllPharmacies);

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
router.get('/:id', pharmacyController.getPharmacyProfile);

module.exports = router;
