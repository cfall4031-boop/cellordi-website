const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "cellordi.db");

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

try { db.exec("ALTER TABLE tickets ADD COLUMN date_livraison TEXT"); } catch (_) {}
try { db.exec("ALTER TABLE messages_contact ADD COLUMN reply_text TEXT"); } catch (_) {}
try { db.exec("ALTER TABLE messages_contact ADD COLUMN replied_at DATETIME"); } catch (_) {}
try { db.exec("ALTER TABLE messages_contact ADD COLUMN archived INTEGER DEFAULT 0"); } catch (_) {}
try { db.exec("ALTER TABLE messages_contact ADD COLUMN telephone TEXT"); } catch (_) {}
// ── Rappels RDV ───────────────────────────────────────────────────────────────
try { db.exec("ALTER TABLE rendezvous ADD COLUMN rappel_60_envoye INTEGER DEFAULT 0"); } catch (_) {}
try { db.exec("ALTER TABLE rendezvous ADD COLUMN rappel_30_envoye INTEGER DEFAULT 0"); } catch (_) {}

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

db.exec(`
  CREATE TABLE IF NOT EXISTS ticket_updates (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id  INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    message    TEXT    NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint    TEXT UNIQUE NOT NULL,
    keys_p256dh TEXT NOT NULL,
    keys_auth   TEXT NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

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

try { db.prepare("ALTER TABLE pieces_catalogue ADD COLUMN cout_vente REAL").run(); } catch {}
try { db.prepare("ALTER TABLE pieces_catalogue ADD COLUMN piece_detachee INTEGER DEFAULT 0").run(); } catch {}
try { db.prepare("ALTER TABLE pieces_catalogue ADD COLUMN nb_demandes INTEGER DEFAULT 0").run(); } catch {}
try { db.prepare("ALTER TABLE pieces_catalogue ADD COLUMN quantite_stock INTEGER DEFAULT 0").run(); } catch {}
try { db.prepare("ALTER TABLE pieces_catalogue ADD COLUMN seuil_alerte INTEGER DEFAULT 1").run(); } catch {}
try { db.prepare("UPDATE pieces_catalogue SET seuil_alerte = 1 WHERE seuil_alerte = 3").run(); } catch {}
try { db.prepare("ALTER TABLE pieces_catalogue ADD COLUMN photos TEXT DEFAULT '[]'").run(); } catch {}
try { db.prepare("ALTER TABLE pieces_catalogue ADD COLUMN masque INTEGER DEFAULT 0").run(); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS mouvements_stock (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    piece_id      INTEGER NOT NULL REFERENCES pieces_catalogue(id) ON DELETE CASCADE,
    type          TEXT    NOT NULL CHECK(type IN ('entree','sortie','ajustement')),
    quantite      INTEGER NOT NULL,
    cout_unitaire REAL    DEFAULT 0,
    prix_unitaire REAL    DEFAULT 0,
    notes         TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS notes_admin (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    titre      TEXT    NOT NULL DEFAULT 'Note sans titre',
    contenu    TEXT    DEFAULT '',
    couleur    TEXT    DEFAULT '#1e3a5f',
    epingled   INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ── REGISTRE FINANCIER ────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS registre_financier (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    type           TEXT    NOT NULL CHECK(type IN ('pret','emprunt','autre')),
    personne       TEXT    NOT NULL,
    description    TEXT    DEFAULT '',
    montant        REAL    NOT NULL,
    date_echeance  TEXT,
    statut         TEXT    DEFAULT 'actif' CHECK(statut IN ('actif','rembourse','annule')),
    notes          TEXT    DEFAULT '',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ── VERSEMENTS DU REGISTRE FINANCIER ─────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS versements_registre (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    entree_id  INTEGER NOT NULL REFERENCES registre_financier(id) ON DELETE CASCADE,
    montant    REAL    NOT NULL,
    notes      TEXT    DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ── MIGRATIONS REGISTRE FINANCIER : nouvelles colonnes ───────────────────────
const _regCols = [
  ["portee",           "TEXT DEFAULT 'entreprise'"],
  ["limite_credit",    "REAL"],
  ["paiement_minimum", "REAL"],
  ["taux_interet",     "REAL"],
  ["categorie_actif",  "TEXT"],
  ["cout_achat",       "REAL"],
  ["date_valeur",      "TEXT"],
];
_regCols.forEach(([col, def]) => {
  try { db.prepare(`ALTER TABLE registre_financier ADD COLUMN ${col} ${def}`).run(); } catch {}
});

// ── MIGRATION CHECK registre_financier : ajouter type='actif' ────────────────
(function () {
  try {
    const r = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='registre_financier'").get();
    if (!r || !r.sql || r.sql.indexOf("'actif'") !== -1) return;
    db.pragma("foreign_keys = OFF");
    db.transaction(() => {
      db.exec([
        "CREATE TABLE registre_financier_v2 (",
        "  id INTEGER PRIMARY KEY AUTOINCREMENT,",
        "  type TEXT NOT NULL,",
        "  personne TEXT NOT NULL,",
        "  description TEXT DEFAULT '',",
        "  montant REAL NOT NULL,",
        "  date_echeance TEXT,",
        "  statut TEXT DEFAULT 'actif',",
        "  notes TEXT DEFAULT '',",
        "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,",
        "  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,",
        "  portee TEXT DEFAULT 'entreprise',",
        "  limite_credit REAL,",
        "  paiement_minimum REAL,",
        "  taux_interet REAL,",
        "  categorie_actif TEXT,",
        "  cout_achat REAL,",
        "  date_valeur TEXT",
        ")",
      ].join(" "));
      db.exec([
        "INSERT INTO registre_financier_v2",
        "(id,type,personne,description,montant,date_echeance,statut,notes,",
        "created_at,updated_at,portee,limite_credit,paiement_minimum,",
        "taux_interet,categorie_actif,cout_achat,date_valeur)",
        "SELECT id,type,personne,description,montant,date_echeance,statut,notes,",
        "created_at,updated_at,portee,limite_credit,paiement_minimum,",
        "taux_interet,categorie_actif,cout_achat,date_valeur",
        "FROM registre_financier",
      ].join(" "));
      db.exec("DROP TABLE registre_financier");
      db.exec("ALTER TABLE registre_financier_v2 RENAME TO registre_financier");
    })();
    db.pragma("foreign_keys = ON");
    console.log("Migration: registre_financier type=actif ajoute.");
  } catch (e) {
    try { db.pragma("foreign_keys = ON"); } catch {}
    console.error("Migration registre_financier:", e && e.message);
  }
})();

// ── HISTORIQUE VALEURS ACTIFS ─────────────────────────────────────────────────
db.exec([
  "CREATE TABLE IF NOT EXISTS actifs_historique (",
  "  id INTEGER PRIMARY KEY AUTOINCREMENT,",
  "  entree_id INTEGER NOT NULL REFERENCES registre_financier(id) ON DELETE CASCADE,",
  "  valeur REAL NOT NULL,",
  "  notes TEXT DEFAULT '',",
  "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
  ")",
].join(" "));

// ── BILANS NETS MENSUELS ──────────────────────────────────────────────────────
db.exec([
  "CREATE TABLE IF NOT EXISTS bilans_nets (",
  "  id INTEGER PRIMARY KEY AUTOINCREMENT,",
  "  date_bilan TEXT NOT NULL,",
  "  total_actifs REAL NOT NULL,",
  "  total_passifs REAL NOT NULL,",
  "  valeur_nette REAL NOT NULL,",
  "  portee TEXT DEFAULT 'tout',",
  "  notes TEXT DEFAULT '',",
  "  created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
  ")",
].join(" "));

// ── PARAMÈTRES RAPPELS RDV ────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS rdv_rappel_settings (
    id      INTEGER PRIMARY KEY CHECK(id = 1),
    actif   INTEGER DEFAULT 1,
    delai_1 INTEGER DEFAULT 60,
    delai_2 INTEGER DEFAULT 30
  );
`);
// Initialiser la ligne de config si elle n'existe pas
db.prepare("INSERT OR IGNORE INTO rdv_rappel_settings (id, actif, delai_1, delai_2) VALUES (1, 1, 60, 30)").run();

// ── TYPES DE FACTURES (personnalisables) ─────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS facture_types (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    label      TEXT    NOT NULL,
    color      TEXT    NOT NULL DEFAULT '#6B7280',
    ordre      INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

(function seedFactureTypes() {
  const count = db.prepare("SELECT COUNT(*) as c FROM facture_types").get();
  if (count.c > 0) return;
  const ins = db.prepare("INSERT INTO facture_types (label, color, ordre) VALUES (?, ?, ?)");
  const defaults = [
    ["Carte de crédit", "#FF8C00", 0],
    ["Marge de crédit", "#8B5CF6", 1],
    ["Dette",           "#EF4444", 2],
    ["Abonnement",      "#3B82F6", 3],
    ["Loyer / Utilités","#14B8A6", 4],
    ["Autre",           "#6B7280", 5],
  ];
  db.transaction(() => { for (const [l, c, o] of defaults) ins.run(l, c, o); })();
  console.log("✅ Types de factures initialisés.");
})();

db.exec(`
  CREATE TABLE IF NOT EXISTS factures_calendrier (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    titre         TEXT    NOT NULL,
    montant       REAL,
    type_facture  TEXT    NOT NULL DEFAULT 'autre',
    date_echeance TEXT    NOT NULL,
    statut        TEXT    NOT NULL DEFAULT 'en_attente',
    recurrence    TEXT    DEFAULT 'aucune',
    notes         TEXT    DEFAULT '',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS horaires_dispo (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    jour  INTEGER NOT NULL,
    heure TEXT    NOT NULL,
    actif INTEGER DEFAULT 1,
    UNIQUE(jour, heure)
  );
`);

function seedHoraires() {
  const count = db.prepare("SELECT COUNT(*) as c FROM horaires_dispo").get();
  if (count.c > 0) return;
  const heuresLV  = ["11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00"];
  const heuresSam = ["12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];
  const insert = db.prepare("INSERT OR IGNORE INTO horaires_dispo (jour, heure, actif) VALUES (?, ?, ?)");
  const insertMany = db.transaction(() => {
    for (let jour = 1; jour <= 5; jour++) {
      for (const h of heuresLV) insert.run(jour, h, 1);
    }
    for (const h of heuresSam) {
      insert.run(6, h, 1);
    }
  });
  insertMany();
  console.log("✅ Horaires initialisés : Lun–Ven 10:30–18h, Sam 11:30–17h, Dim fermé.");
}

const hasOldSchedule = db.prepare("SELECT COUNT(*) as c FROM horaires_dispo WHERE heure = '09:00' AND actif = 1").get();
if (hasOldSchedule.c > 0) {
  db.prepare("DELETE FROM horaires_dispo").run();
  console.log("🔄 Migration horaires → créneaux de 30 min.");
}
seedHoraires();

db.prepare("DELETE FROM horaires_dispo WHERE heure IN ('10:00','10:30')").run();
db.prepare("DELETE FROM horaires_dispo WHERE jour BETWEEN 1 AND 5 AND heure IN ('18:30','19:00')").run();
db.prepare("DELETE FROM horaires_dispo WHERE jour = 6 AND heure IN ('11:00','11:30','17:30','18:00')").run();

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

// ── ABSENCES (périodes de fermeture) ─────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS absences (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    date_debut TEXT NOT NULL,
    date_fin   TEXT NOT NULL,
    motif      TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ── BIBLIOTHÈQUE DE DOCUMENTS ────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS biblio_dossiers (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER REFERENCES biblio_dossiers(id) ON DELETE SET NULL,
    nom       TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS biblio_docs (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    dossier_id   INTEGER REFERENCES biblio_dossiers(id) ON DELETE SET NULL,
    titre        TEXT NOT NULL,
    description  TEXT DEFAULT '',
    type_fichier TEXT NOT NULL DEFAULT 'autre',
    nom_fichier  TEXT,
    taille       INTEGER DEFAULT 0,
    chemin       TEXT,
    contenu      TEXT,
    supprime_at  DATETIME,
    ouvert_at    DATETIME,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS biblio_tags (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    label   TEXT NOT NULL UNIQUE,
    couleur TEXT NOT NULL DEFAULT '#6B7280'
  );

  CREATE TABLE IF NOT EXISTS biblio_doc_tags (
    doc_id INTEGER NOT NULL REFERENCES biblio_docs(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES biblio_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (doc_id, tag_id)
  );

  CREATE TABLE IF NOT EXISTS biblio_versions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_id     INTEGER NOT NULL REFERENCES biblio_docs(id) ON DELETE CASCADE,
    chemin     TEXT,
    contenu    TEXT,
    taille     INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS biblio_notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_id     INTEGER NOT NULL REFERENCES biblio_docs(id) ON DELETE CASCADE,
    contenu    TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ── CELL CARE ─────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS cc_parametres (
    id                      INTEGER PRIMARY KEY CHECK(id=1),
    plans_config            TEXT    NOT NULL DEFAULT '{}',
    offres_config           TEXT    NOT NULL DEFAULT '{}',
    conditions_text         TEXT    DEFAULT '',
    avis_garantie_text      TEXT    DEFAULT '',
    conditions_version      TEXT    DEFAULT '1.0',
    duree_conservation_mois INTEGER DEFAULT 60,
    updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cc_membres (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    numero                TEXT    UNIQUE NOT NULL,
    prenom                TEXT    NOT NULL,
    nom                   TEXT    NOT NULL,
    telephone             TEXT    NOT NULL,
    email                 TEXT,
    consentement_sms      INTEGER DEFAULT 0,
    consentement_sms_date DATETIME,
    code_parrainage       TEXT    UNIQUE NOT NULL,
    created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cc_appareils (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    membre_id     INTEGER NOT NULL REFERENCES cc_membres(id) ON DELETE CASCADE,
    marque        TEXT    NOT NULL,
    modele        TEXT    NOT NULL,
    couleur       TEXT,
    imei          TEXT    NOT NULL,
    photo_avant   TEXT,
    photo_arriere TEXT,
    inspecte      INTEGER DEFAULT 0,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cc_souscriptions (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    membre_id               INTEGER NOT NULL REFERENCES cc_membres(id),
    appareil_id             INTEGER NOT NULL REFERENCES cc_appareils(id),
    formule                 TEXT    NOT NULL CHECK(formule IN ('essentiel','plus')),
    prix_paye               REAL    NOT NULL,
    offres_appliquees       TEXT    DEFAULT '[]',
    technicien_vendeur      TEXT,
    date_carence_fin        TEXT    NOT NULL,
    date_annulation_limite  TEXT    NOT NULL,
    date_fin                TEXT    NOT NULL,
    vitres_restantes        INTEGER NOT NULL DEFAULT 2,
    statut                  TEXT    DEFAULT 'en_carence'
                            CHECK(statut IN ('en_carence','actif','vitres_epuisees','expire','annule')),
    annulation_date         DATETIME,
    annulation_motif        TEXT,
    version_conditions      TEXT    NOT NULL,
    signature               TEXT    NOT NULL,
    signature_date          DATETIME NOT NULL,
    created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cc_reclamations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    souscription_id INTEGER NOT NULL REFERENCES cc_souscriptions(id),
    type            TEXT    NOT NULL CHECK(type IN ('vitre_avant','vitre_arriere','ecran_complet','batterie')),
    photos          TEXT    DEFAULT '[]',
    technicien      TEXT,
    cout_pieces     REAL    DEFAULT 0,
    temps_minutes   INTEGER DEFAULT 0,
    rabais_applique REAL    DEFAULT 0,
    montant_client  REAL    DEFAULT 0,
    notes           TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cc_parrainages (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    membre_parrain_id   INTEGER NOT NULL REFERENCES cc_membres(id),
    souscription_id     INTEGER NOT NULL REFERENCES cc_souscriptions(id),
    filleul_nom         TEXT    NOT NULL,
    filleul_telephone   TEXT    NOT NULL,
    date_parrainage     DATETIME DEFAULT CURRENT_TIMESTAMP,
    rabais_accorde      REAL    NOT NULL,
    reparation_id       INTEGER REFERENCES tickets(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS cc_journal (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    action           TEXT    NOT NULL,
    table_cible      TEXT,
    enregistrement_id INTEGER,
    details          TEXT,
    utilisateur      TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = { db, initAdmin, genererNumeroTicket };
