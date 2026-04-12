const express = require('express');
const router = express.Router();

const { registerPatient, loginPatient, loginPharmacy } = require('../controllers/auth.controller');

/**
 * @swagger
 * /api/auth/patient/register:
 *   post:
 *     summary: Inscription d'un patient
 *     tags: [Auth]
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
 *       400:
 *         description: Email déjà utilisé
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
 *                   example: "Cet email est déjà utilisé"
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

// Note: Admin and Doctor auth could be added later based on the workflow

module.exports = router;
