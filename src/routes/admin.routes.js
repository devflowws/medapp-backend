const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/admin-dashboard.controller');

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Statistiques globales du dashboard admin
 *     tags: [Admin - Dashboard]
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                     topPharmacies:
 *                       type: array
 *                     topDoctors:
 *                       type: array
 *                     recentActivity:
 *                       type: array
 */
router.get('/dashboard/stats', adminDashboardController.getDashboardStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Liste de tous les utilisateurs (paginée)
 *     tags: [Admin - Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [doctor, patient, pharmacy, admin]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
router.get('/users', adminDashboardController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Activer/Désactiver un utilisateur
 *     tags: [Admin - Users]
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
 *             required: [type]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [doctor, pharmacy, admin]
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.patch('/users/:id/status', adminDashboardController.toggleUserStatus);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Admin - Users]
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
 *             required: [type]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [doctor, patient, pharmacy, admin]
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 */
router.delete('/users/:id', adminDashboardController.deleteUser);

module.exports = router;
