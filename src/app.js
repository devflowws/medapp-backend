const express = require('express');
const cors = require('cors');

// Importation des middlewares globaux
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

// Import Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Vérifie le statut de l'API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Importation des routes (à décommenter au fur et à mesure de leur création)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/doctors', require('./routes/doctor.routes'));
app.use('/api/patients', require('./routes/patient.routes'));
app.use('/api/pharmacies', require('./routes/pharmacy.routes'));
app.use('/api/prescriptions', require('./routes/prescription.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/messages', require('./routes/message.routes'));

// Middleware de gestion globale des erreurs
app.use(errorHandler);

module.exports = app;
