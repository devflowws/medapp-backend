require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { sequelize } = require('./src/models');
const { initSockets } = require('./src/sockets');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialisation de Socket.io
initSockets(server);

// Démarrage du serveur et connexion à la base de données
const startServer = async () => {
  try {
    // Vérification de la connexion à la BD
    await sequelize.authenticate();
    console.log('Connexion à PostgreSQL établie avec succès.');

    // Synchronisation des modèles (à retirer en prod pour utiliser des migrations)
    await sequelize.sync({ alter: true });
    console.log('Modèles Sequelize synchronisés.');

    server.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();
