const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Envoyer un message dans une commande
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order_id, expediteur_type, expediteur_id, contenu]
 *             properties:
 *               order_id:
 *                 type: string
 *                 format: uuid
 *               expediteur_type:
 *                 type: string
 *                 enum: [patient, pharmacy]
 *                 example: "patient"
 *               expediteur_id:
 *                 type: string
 *                 format: uuid
 *               contenu:
 *                 type: string
 *                 example: "Bonjour, quand est-ce que ma commande sera prête?"
 *     responses:
 *       201:
 *         description: Message envoyé avec succès
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
 */
router.post('/', messageController.sendMessage);

/**
 * @swagger
 * /api/messages/order/{orderId}:
 *   get:
 *     summary: Récupérer tous les messages d'une commande
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la commande
 *     responses:
 *       200:
 *         description: Liste des messages
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
 *                       order_id:
 *                         type: string
 *                         format: uuid
 *                       expediteur_type:
 *                         type: string
 *                       expediteur_id:
 *                         type: string
 *                         format: uuid
 *                       contenu:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Erreur serveur
 */
router.get('/order/:orderId', messageController.getOrderMessages);

module.exports = router;
