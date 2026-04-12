const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MedApp API API',
      version: '1.0.0',
      description: 'API Docs pour la plateforme de santé MedApp',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveur de Développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  // Les routes où Swagger va lire les commentaires JSDoc
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
