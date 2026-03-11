const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

// En production Railway : DB_PATH=/data/cellordi.db (Volume persistant)
// En développement      : fichier local backend/cellordi.db
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "cellordi.db");

// Créer le répertoire parent si nécessaire (ex: /data sur Railway)
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);
console.log(`📦 Base de données : ${DB_PATH}`);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT    UNIQUE NOT NULL,
    password   TEXT    NOT NULL,
    nom        TEXT    NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clients (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    prenom     TEXT NOT NULL,
    nom        TEXT NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    telephone  TEXT,
    adresse    TEXT,
    notes      TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rendezvous (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id     INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    prenom        TEXT NOT NULL,
    nom           TEXT NOT NULL,
    email         TEXT NOT NULL,
    telephone     TEXT,
    type_appareil TEXT NOT NULL,
    date_rdv      TEXT NOT NULL,
    heure         TEXT,
    description   TEXT,
    statut        TEXT DEFAULT 'en_attente'
                  CHECK(statut IN ('en_attente','confirme','annule','complete')),
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    numero          TEXT UNIQUE NOT NULL,
    client_id       INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    rendezvous_id   INTEGER REFERENCES rendezvous(id) ON DELETE SET NULL,
    prenom          TEXT NOT NULL,
    nom             TEXT NOT NULL,
    email           TEXT NOT NULL,
    telephone       TEXT,
    type_appareil   TEXT NOT NULL,
    marque          TEXT,
    modele          TEXT,
    probleme        TEXT NOT NULL,
    diagnostic      TEXT,
    pieces          TEXT,
    cout_estime     REAL DEFAULT 0,
    cout_final      REAL DEFAULT 0,
    statut          TEXT DEFAULT 'recu'
                    CHECK(statut IN ('recu','diagnostic','en_cours','termine','pret','livre')),
    date_reception  DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_estimee    TEXT,
    date_completion DATETIME,
    notes_internes  TEXT,
    date_livraison  TEXT,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages_contact (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nom        TEXT NOT NULL,
    email      TEXT NOT NULL,
    sujet      TEXT NOT NULL,
    message    TEXT NOT NULL,
    lu         INTEGER DEFAULT 0,
    repondu    INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS decharges (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id     INTEGER REFERENCES tickets(id) ON DELETE SET NULL,
    nom           TEXT NOT NULL,
    prenom        TEXT NOT NULL,
    telephone     TEXT,
    type_appareil TEXT NOT NULL,
    probleme      TEXT NOT NULL,
    auth_diag     TEXT NOT NULL DEFAULT 'OUI' CHECK(auth_diag IN ('OUI','NON')),
    auth_rep      TEXT NOT NULL DEFAULT 'OUI' CHECK(auth_rep IN ('OUI','NON')),
    signature     TEXT,
    statut        TEXT DEFAULT 'en_attente' CHECK(statut IN ('en_attente','traitee')),
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: add date_livraison if column is missing (existing databases)
try { db.exec("ALTER TABLE tickets ADD COLUMN date_livraison TEXT"); } catch (_) {}

function initAdmin() {
  const adminEmail    = process.env.ADMIN_EMAIL    || "admin@reparationcellordi.ca";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!";
  const adminNom      = process.env.ADMIN_NOM      || "Administrateur";

  const existing = db.prepare("SELECT id FROM admins WHERE email = ?").get(adminEmail);
  if (!existing) {
    const hash = bcrypt.hashSync(adminPassword, 10);
    db.prepare("INSERT INTO admins (email, password, nom) VALUES (?, ?, ?)")
      .run(adminEmail, hash, adminNom);
    console.log(`✅ Admin créé : ${adminEmail}`);
  }
}

function genererNumeroTicket() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand    = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `RCO-${dateStr}-${rand}`;
}

module.exports = { db, initAdmin, genererNumeroTicket };
