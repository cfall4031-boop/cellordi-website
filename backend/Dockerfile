FROM node:20-bookworm-slim

# Outils de compilation requis pour better-sqlite3 (module natif)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier et installer les dépendances (depuis backend/ si contexte = repo root)
COPY backend/package*.json ./
RUN npm ci

# Copier le code source du backend
COPY backend/ .

# Créer le dossier /data pour la base de données (Volume Railway)
RUN mkdir -p /data

EXPOSE 3001

CMD ["node", "server.js"]
