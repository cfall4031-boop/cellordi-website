FROM node:20-bookworm-slim

# Outils de compilation requis pour better-sqlite3 (module natif)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Le contexte Docker = dossier backend/ (root directory Railway = /backend)
COPY package*.json ./
RUN npm ci

COPY . .

# Créer le dossier /data pour la base de données (Volume Railway)
RUN mkdir -p /data

EXPOSE 3001

CMD ["node", "server.js"]
