FROM node:18-bullseye-slim

# Outils de compilation requis pour better-sqlite3 (module natif)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier et installer les dépendances
COPY package*.json ./
RUN npm ci

# Copier le code source
COPY . .

# Créer le dossier /data pour la base de données (Volume Railway)
RUN mkdir -p /data

EXPOSE 3001

CMD ["node", "server.js"]
