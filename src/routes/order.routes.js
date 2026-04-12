const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Créer une nouvelle commande
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pharmacie_id, patient_id, requiert_ordonnance]
 *             properties:
 *               ordonnance_id:
 *                 type: string
 *                 format: uuid
 *               pharmacie_id:
 *                 type: string
 *                 format: uuid
 *               patient_id:
 *                 type: string
 *                 format: uuid
 *               requiert_ordonnance:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Commande créée avec succès
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
 *         description: L'ordonnance est requise
 */
router.post('/', protect(['admin', 'patient']), orderController.createOrder);

/**
 * @swagger
 * /api/orders/pharmacy/{pharmacyId}:
 *   get:
 *     summary: Récupérer toutes les commandes d'une pharmacie
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: pharmacyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la pharmacie
 *     responses:
 *       200:
 *         description: Liste des commandes
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
 *       500:
 *         description: Erreur serveur
 */
router.get('/pharmacy/:pharmacyId', protect(['admin', 'pharmacy']), orderController.getPharmacyOrders);

/**
 * @swagger
 * /api/orders/patient/{patientId}:
 *   get:
 *     summary: Récupérer toutes les commandes d'un patient
 *     tags: [Orders]
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
 *         description: Liste des commandes
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
 *       500:
 *         description: Erreur serveur
 */
router.get('/patient/:patientId', protect(['admin', 'patient']), orderController.getPatientOrders);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Mettre à jour le statut d'une commande
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la commande
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [statut]
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [en_attente, accepte, indisponible, livre, refuse]
 *                 example: "accepte"
 *               message_pharmacie:
 *                 type: string
 *                 example: "Votre commande sera prête dans 30 minutes"
 *     responses:
 *       200:
 *         description: Statut mis à jour
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
 *         description: Commande non trouvée
 *       400:
 *         description: Statut invalide
 */
router.put('/:id/status', protect(['admin', 'pharmacy']), orderController.updateOrderStatus);

module.exports = router;
