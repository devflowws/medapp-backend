const express = require('express');
const router = express.Router();
const { registerPatient, loginPatient, registerPharmacy, loginPharmacy, refreshToken } = require('../controllers/auth.controller');
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changePassword
} = require('../controllers/admin-auth.controller');
const { protect } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/auth/patient/register:
 *   post:
 *     summary: Inscription d'un patient
 *     tags: [Auth - Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, prenoms, nom_utilisateur, email, telephone, mot_de_passe]
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Doe"
 *               prenoms:
 *                 type: string
 *                 example: "John"
 *               nom_utilisateur:
 *                 type: string
 *                 example: "johndoe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               telephone:
 *                 type: string
 *                 example: "+1234567890"
 *               mot_de_passe:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123!"
 *     responses:
 *       201:
 *         description: Patient créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 token:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Email déjà utilisé
 */
router.post('/patient/register', registerPatient);

/**
 * @swagger
 * /api/auth/patient/login:
 *   post:
 *     summary: Connexion d'un patient
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifiant, mot_de_passe]
 *             properties:
 *               identifiant:
 *                 type: string
 *                 description: Email, nom d'utilisateur ou téléphone
 *                 example: "john@example.com"
 *               mot_de_passe:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123!"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
 *                     role:
 *                       type: string
 *                       example: "patient"
 *       401:
 *         description: Identifiants incorrects
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
 *                   example: "Identifiants incorrects"
 */
router.post('/patient/login', loginPatient);

/**
 * @swagger
 * /api/auth/pharmacy/login:
 *   post:
 *     summary: Connexion d'une pharmacie
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, mot_de_passe]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "pharmacy@example.com"
 *               mot_de_passe:
 *                 type: string
 *                 format: password
 *                 example: "PharmacyPass123!"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     nom:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: "pharmacy"
 *       401:
 *         description: Identifiants incorrects
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
 *                   example: "Identifiants incorrects"
 */
router.post('/pharmacy/login', loginPharmacy);

/**
 * @swagger
 * /api/auth/pharmacy/register:
 *   post:
 *     summary: Inscription d'une pharmacie
 *     tags: [Auth - Pharmacie]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, adresse, telephone, email, mot_de_passe]
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Pharmacie du Plateau"
 *               adresse:
 *                 type: string
 *                 example: "123 Avenue Franchet d'Esperey"
 *               telephone:
 *                 type: string
 *                 example: "+225 27 21 22 23 24"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contact@pharmacie-plateau.ci"
 *               mot_de_passe:
 *                 type: string
 *                 format: password
 *                 example: "PharmaPass123!"
 *               horaires:
 *                 type: string
 *                 example: "Lundi-Vendredi 7h30-21h00"
 *               latitude:
 *                 type: number
 *                 example: 5.316667
 *               longitude:
 *                 type: number
 *                 example: -4.016667
 *     responses:
 *       201:
 *         description: Pharmacie créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Email déjà utilisé
 */
router.post('/pharmacy/register', registerPharmacy);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rafraîchir le token JWT
 *     tags: [Auth - Global]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Nouveau token généré
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Refresh token invalide
 */
router.post('/refresh', refreshToken);

// ============================================
// ADMIN AUTH
// ============================================

/**
 * @swagger
 * /api/auth/admin/register:
 *   post:
 *     summary: Inscription d'un administrateur
 *     tags: [Auth - Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nom, prenoms, email, mot_de_passe]
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Admin"
 *               prenoms:
 *                 type: string
 *                 example: "Super"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@medapp.com"
 *               mot_de_passe:
 *                 type: string
 *                 format: password
 *                 example: "AdminPass123!"
 *               role:
 *                 type: string
 *                 enum: [super_admin, admin, moderateur]
 *                 example: "admin"
 *     responses:
 *       201:
 *         description: Admin créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Email déjà utilisé
 */
router.post('/admin/register', registerAdmin);

/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     summary: Connexion d'un administrateur
 *     tags: [Auth - Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, mot_de_passe]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@medapp.com"
 *               mot_de_passe:
 *                 type: string
 *                 format: password
 *                 example: "AdminPass123!"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Identifiants incorrects
 *       403:
 *         description: Compte désactivé
 */
router.post('/admin/login', loginAdmin);

/**
 * @swagger
 * /api/auth/admin/profile/{id}:
 *   get:
 *     summary: Récupérer le profil d'un admin
 *     tags: [Auth - Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Profil admin
 *       404:
 *         description: Admin non trouvé
 */
router.get('/admin/profile/:id', protect(['admin']), getAdminProfile);

/**
 * @swagger
 * /api/auth/admin/profile/{id}:
 *   put:
 *     summary: Mettre à jour le profil d'un admin
 *     tags: [Auth - Admin]
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
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       404:
 *         description: Admin non trouvé
 */
router.put('/admin/profile/:id', protect(['admin']), updateAdminProfile);

/**
 * @swagger
 * /api/auth/admin/{id}/change-password:
 *   post:
 *     summary: Changer le mot de passe d'un admin
 *     tags: [Auth - Admin]
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
router.post('/admin/:id/change-password', protect(['admin']), changePassword);

module.exports = router;
