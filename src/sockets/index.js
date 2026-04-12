const { Server } = require('socket.io');

let io;

const initSockets = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // En production, restreindre aux domaines autorisés
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Nouvelle connexion Socket.io: ${socket.id}`);

    // Possibilité d'ajouter des middlewares d'authentification ici
    
    // Exemple d'événement: un utilisateur rejoint une "room" dédiée (ex: sa propre file d'attente)
    socket.on('join', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`Déconnexion Socket.io: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io n\\\'est pas initialisé');
  }
  return io;
};

module.exports = { initSockets, getIo };
