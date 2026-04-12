# ===== BUILD STAGE =====
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && \
    npm cache clean --force

# ===== PRODUCTION STAGE =====
FROM node:18-alpine

WORKDIR /app

# Installer curl pour les healthchecks
RUN apk add --no-cache curl

# Copier les dépendances installées
COPY --from=builder /app/node_modules ./node_modules

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Démarrer le serveur
CMD ["node", "server.js"]
