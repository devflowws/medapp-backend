const jwt = require('jsonwebtoken');

const protect = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      let token;

      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return res.status(401).json({ status: 'error', message: 'Non autorisé, pas de token fourni' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Stocker l'utilisateur dans la requête
      req.user = decoded;

      // Vérification du rôle si strict
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ status: 'error', message: 'Accès refusé pour ce rôle' });
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
         return res.status(401).json({ status: 'error', message: 'Token expiré' });
      }
      return res.status(401).json({ status: 'error', message: 'Token invalide' });
    }
  };
};

module.exports = { protect };
