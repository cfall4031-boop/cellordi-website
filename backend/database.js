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
                    CHECK(statut IN ('recu','diagnostic','en_cours','en_suspend','termine','pret','livre')),
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

// Migration: add reply fields to messages_contact (existing databases)
try { db.exec("ALTER TABLE messages_contact ADD COLUMN reply_text TEXT"); } catch (_) {}
try { db.exec("ALTER TABLE messages_contact ADD COLUMN replied_at DATETIME"); } catch (_) {}

// Migration: add archived field to messages_contact
try { db.exec("ALTER TABLE messages_contact ADD COLUMN archived INTEGER DEFAULT 0"); } catch (_) {}

// Migration: add telephone field to messages_contact
try { db.exec("ALTER TABLE messages_contact ADD COLUMN telephone TEXT"); } catch (_) {}

// Migration: allow 'en_suspend' in tickets.statut CHECK constraint (SQLite requires table rebuild)
try {
  const row = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='tickets'").get();
  if (row && row.sql && !row.sql.includes("'en_suspend'")) {
    db.pragma("foreign_keys = OFF");
    db.exec(`
      BEGIN TRANSACTION;
      CREATE TABLE tickets_new (
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
                        CHECK(statut IN ('recu','diagnostic','en_cours','en_suspend','termine','pret','livre')),
        date_reception  DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_estimee    TEXT,
        date_completion DATETIME,
        notes_internes  TEXT,
        date_livraison  TEXT,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO tickets_new (id, numero, client_id, rendezvous_id, prenom, nom, email, telephone, type_appareil, marque, modele, probleme, diagnostic, pieces, cout_estime, cout_final, statut, date_reception, date_estimee, date_completion, notes_internes, date_livraison, updated_at)
        SELECT id, numero, client_id, rendezvous_id, prenom, nom, email, telephone, type_appareil, marque, modele, probleme, diagnostic, pieces, cout_estime, cout_final, statut, date_reception, date_estimee, date_completion, notes_internes, date_livraison, updated_at FROM tickets;
      DROP TABLE tickets;
      ALTER TABLE tickets_new RENAME TO tickets;
      COMMIT;
    `);
    db.pragma("foreign_keys = ON");
    console.log("✓ Migration: contrainte CHECK tickets.statut mise à jour (en_suspend ajouté)");
  }
} catch (err) {
  console.error("Migration CHECK tickets.statut échouée :", err?.message || err);
}

// ── MISES À JOUR TICKET (tracking updates) ────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS ticket_updates (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id  INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    message    TEXT    NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ── PUSH SUBSCRIPTIONS (notifications PWA) ────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint    TEXT UNIQUE NOT NULL,
    keys_p256dh TEXT NOT NULL,
    keys_auth   TEXT NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ── CALCULATEUR DE PRIX ────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS pieces_catalogue (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    type_appareil    TEXT NOT NULL,
    modele           TEXT,
    type_piece       TEXT NOT NULL,
    cout_fournisseur REAL NOT NULL,
    fournisseur      TEXT DEFAULT 'Tan Star Trade',
    notes            TEXT,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS prix_concurrents (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    type_appareil       TEXT NOT NULL,
    type_reparation     TEXT NOT NULL,
    prix_cd_solution    REAL,
    prix_fix_moi        REAL,
    prix_mobile_klinik  REAL,
    source              TEXT,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS appareils_valeur (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    type_appareil   TEXT NOT NULL,
    valeur_marche   REAL NOT NULL,
    annee           INTEGER,
    notes           TEXT,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Table des disponibilités hebdomadaires (admin gère quels créneaux sont ouverts)
db.exec(`
  CREATE TABLE IF NOT EXISTS horaires_dispo (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    jour  INTEGER NOT NULL,   -- 1=Lun, 2=Mar, 3=Mer, 4=Jeu, 5=Ven, 6=Sam
    heure TEXT    NOT NULL,   -- "09:00"
    actif INTEGER DEFAULT 1,  -- 1=disponible, 0=fermé
    UNIQUE(jour, heure)
  );
`);

// Horaires officiels : Lun–Ven 10h–19h, Sam 11h–18h, Dim fermé
function seedHoraires() {
  const count = db.prepare("SELECT COUNT(*) as c FROM horaires_dispo").get();
  if (count.c > 0) return;
  const heuresLV  = ["10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"];
  const heuresSam = ["11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"];
  const insert = db.prepare("INSERT OR IGNORE INTO horaires_dispo (jour, heure, actif) VALUES (?, ?, ?)");
  const insertMany = db.transaction(() => {
    for (let jour = 1; jour <= 5; jour++) {   // Lun–Ven actifs 10h–19h
      for (const h of heuresLV) insert.run(jour, h, 1);
    }
    for (const h of heuresSam) {              // Sam actifs 11h–18h
      insert.run(6, h, 1);
    }
  });
  insertMany();
  console.log("✅ Horaires initialisés : Lun–Ven 10h–19h, Sam 11h–18h, Dim fermé.");
}

// Migration : si l'ancien schedule (sans :30) est détecté, effacer et re-seeder
const hasOldSchedule = db.prepare("SELECT COUNT(*) as c FROM horaires_dispo WHERE heure = '09:00' AND actif = 1").get();
const has30min = db.prepare("SELECT COUNT(*) as c FROM horaires_dispo WHERE heure = '10:30'").get();
if (hasOldSchedule.c > 0 || has30min.c === 0) {
  db.prepare("DELETE FROM horaires_dispo").run();
  console.log("🔄 Migration horaires → créneaux de 30 min.");
}
seedHoraires();

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
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `RCO-${rand}`;
}

module.exports = { db, initAdmin, genererNumeroTicket };
